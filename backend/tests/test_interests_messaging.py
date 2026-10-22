from django.test import TestCase

from apps.interests.models import Interest, Shortlist
from apps.messaging.models import Conversation, Message

from .factories import client_for, make_member, make_user


class InterestTests(TestCase):
    def setUp(self):
        self.a_user, self.a = make_member("male")
        self.b_user, self.b = make_member("female")
        self.A, self.B = client_for(self.a_user), client_for(self.b_user)

    def send(self, client, to, **kw):
        return client.post("/api/interests/send/", {"receiver_id": str(to.id), **kw}, format="json")

    def test_send_and_list(self):
        self.assertEqual(self.send(self.A, self.b, message="Hare Krishna").status_code, 201)
        self.assertEqual(self.A.get("/api/interests/sent/").json()["count"], 1)
        got = self.B.get("/api/interests/received/").json()
        self.assertEqual(got["count"], 1)
        self.assertEqual(got["results"][0]["status"], "pending")

    def test_duplicate_self_and_unknown_are_rejected(self):
        self.send(self.A, self.b)
        self.assertEqual(self.send(self.A, self.b).status_code, 400)
        self.assertEqual(self.send(self.A, self.a).status_code, 400)
        self.assertEqual(client_for(self.a_user).post("/api/interests/send/", {"receiver_id": "00000000-0000-0000-0000-000000000000"}, format="json").status_code, 404)
        self.assertEqual(Interest.objects.count(), 1)

    def test_reverse_duplicate_is_blocked(self):
        self.send(self.A, self.b)
        r = self.send(self.B, self.a)
        self.assertEqual(r.status_code, 400)
        self.assertIn("respond", r.json()["error"].lower())
        self.assertEqual(Interest.objects.count(), 1)

    def test_cannot_contact_unapproved_profile(self):
        _u, hidden = make_member("female", approved=False)
        self.assertEqual(self.send(self.A, hidden).status_code, 404)

    def test_incomplete_sender_is_blocked(self):
        u, _p = make_member("male", complete=False)
        r = self.send(client_for(u), self.b)
        self.assertEqual(r.status_code, 400)
        self.assertIn("missing_fields", r.json())

    def test_only_receiver_can_respond_and_only_once(self):
        i = self.send(self.A, self.b).json()["id"]
        body = {"interest_id": i, "action": "accepted"}
        self.assertEqual(self.A.post("/api/interests/respond/", body, format="json").status_code, 404)  # sender cannot self-accept
        c_user, _c = make_member("female")
        self.assertEqual(client_for(c_user).post("/api/interests/respond/", body, format="json").status_code, 404)  # stranger cannot
        self.assertEqual(self.B.post("/api/interests/respond/", body, format="json").status_code, 200)
        self.assertEqual(self.B.post("/api/interests/respond/", {**body, "action": "rejected"}, format="json").status_code, 404)  # no flip-flopping
        self.assertEqual(Interest.objects.get(id=i).status, "accepted")

    def test_bad_action_rejected(self):
        i = self.send(self.A, self.b).json()["id"]
        self.assertEqual(self.B.post("/api/interests/respond/", {"interest_id": i, "action": "pending"}, format="json").status_code, 400)

    def test_accept_opens_exactly_one_conversation_reject_opens_none(self):
        i = self.send(self.A, self.b).json()["id"]
        self.B.post("/api/interests/respond/", {"interest_id": i, "action": "accepted"}, format="json")
        self.assertEqual(Conversation.objects.count(), 1)
        c_user, c = make_member("female")
        j = self.send(self.A, c).json()["id"]
        client_for(c_user).post("/api/interests/respond/", {"interest_id": j, "action": "rejected"}, format="json")
        self.assertEqual(Conversation.objects.count(), 1)

    def test_users_only_see_their_own_interests(self):
        c_user, c = make_member("female")
        self.send(self.A, self.b)
        self.assertEqual(client_for(c_user).get("/api/interests/received/").json()["count"], 0)
        self.assertEqual(client_for(c_user).get("/api/interests/sent/").json()["count"], 0)


class ShortlistTests(TestCase):
    def setUp(self):
        self.a_user, self.a = make_member("male")
        self.b_user, self.b = make_member("female")
        self.A = client_for(self.a_user)

    def add(self, p):
        return self.A.post("/api/interests/shortlist/", {"shortlisted_profile": str(p.id)}, format="json")

    def test_add_list_remove(self):
        r = self.add(self.b)
        self.assertEqual(r.status_code, 201)
        self.assertEqual(self.A.get("/api/interests/shortlist/").json()["count"], 1)
        self.assertEqual(self.A.delete(f"/api/interests/shortlist/{r.json()['id']}/").status_code, 204)

    def test_rules(self):
        self.add(self.b)
        self.assertEqual(self.add(self.b).status_code, 400)  # duplicate
        self.assertEqual(self.add(self.a).status_code, 400)  # self
        _u, hidden = make_member("female", approved=False)
        self.assertEqual(self.add(hidden).status_code, 400)  # unavailable
        self.assertEqual(Shortlist.objects.count(), 1)

    def test_cannot_remove_someone_elses_entry(self):
        entry = self.add(self.b).json()["id"]
        self.assertEqual(client_for(self.b_user).delete(f"/api/interests/shortlist/{entry}/").status_code, 404)
        self.assertEqual(Shortlist.objects.count(), 1)


class MessagingTests(TestCase):
    def setUp(self):
        self.a_user, self.a = make_member("male", first_name="Arjun")
        self.b_user, self.b = make_member("female", first_name="Radha")
        self.c_user, self.c = make_member("male", first_name="Intruder")
        self.conv = Conversation.objects.create(profile_1=self.a, profile_2=self.b)
        self.A, self.B, self.C = (client_for(u) for u in (self.a_user, self.b_user, self.c_user))

    def test_send_and_read_history_both_sides(self):
        self.assertEqual(self.A.post(f"/api/messages/{self.conv.id}/send/", {"text": "Hare Krishna"}, format="json").status_code, 201)
        self.assertEqual(self.B.post(f"/api/messages/{self.conv.id}/send/", {"text": "Jai Shri Radhe"}, format="json").status_code, 201)
        for who in (self.A, self.B):
            texts = [m["text"] for m in who.get(f"/api/messages/{self.conv.id}/").json()["results"]]
            self.assertEqual(sorted(texts), ["Hare Krishna", "Jai Shri Radhe"])

    def test_non_participant_has_no_access_at_all(self):
        Message.objects.create(conversation=self.conv, sender=self.a, text="private")
        self.assertEqual(self.C.get(f"/api/messages/{self.conv.id}/").json()["count"], 0)
        self.assertEqual(self.C.get("/api/messages/").json()["count"], 0)
        r = self.C.post(f"/api/messages/{self.conv.id}/send/", {"text": "hi"}, format="json")
        self.assertEqual(r.status_code, 404)
        self.assertEqual(Message.objects.count(), 1)

    def test_non_participant_cannot_mark_messages_read(self):
        m = Message.objects.create(conversation=self.conv, sender=self.a, text="unread")
        self.C.get(f"/api/messages/{self.conv.id}/")
        m.refresh_from_db()
        self.assertFalse(m.is_read)

    def test_read_receipts_only_flip_for_the_recipient(self):
        m = Message.objects.create(conversation=self.conv, sender=self.a, text="hello")
        self.A.get(f"/api/messages/{self.conv.id}/")  # sender opening the chat does not mark own message read
        m.refresh_from_db()
        self.assertFalse(m.is_read)
        self.B.get(f"/api/messages/{self.conv.id}/")
        m.refresh_from_db()
        self.assertTrue(m.is_read)

    def test_validation(self):
        url = f"/api/messages/{self.conv.id}/send/"
        for bad in ({}, {"text": ""}, {"text": "   "}, {"text": "x" * 2001}, {"text": "hi", "media_url": "javascript:alert(1)"}):
            self.assertEqual(self.A.post(url, bad, format="json").status_code, 400, bad)

    def test_sender_identity_is_per_viewer_after_account_switching(self):
        self.A.post(f"/api/messages/{self.conv.id}/send/", {"text": "hi"}, format="json")
        mine = self.A.get("/api/messages/").json()["results"][0]["other_profile"]["user"]["first_name"]
        theirs = self.B.get("/api/messages/").json()["results"][0]["other_profile"]["user"]["first_name"]
        self.assertEqual((mine, theirs), ("Radha", "Arjun"))
        profile_ids = {self.A.get("/api/profile/me/").json()["id"], self.B.get("/api/profile/me/").json()["id"]}
        self.assertEqual(len(profile_ids), 2)

    def test_unauthenticated_requests_rejected(self):
        from rest_framework.test import APIClient

        anon = APIClient()
        self.assertEqual(anon.get("/api/messages/").status_code, 401)
        self.assertEqual(anon.post(f"/api/messages/{self.conv.id}/send/", {"text": "x"}, format="json").status_code, 401)
