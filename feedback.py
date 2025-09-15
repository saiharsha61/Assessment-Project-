# feedback.py
# Rating & Feedback module

class Feedback:
    def __init__(self, user, resource_id, rating, comment):
        self.user = user
        self.resource_id = resource_id
        self.rating = rating
        self.comment = comment

class FeedbackService:
    def submit_feedback(self, feedback):
        """Submit feedback for a resource."""
        pass
    def get_feedback(self, resource_id):
        """Get all feedback for a resource."""
        pass
