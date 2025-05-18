from sqlalchemy import Integer, Column, DateTime, Text, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from db import Base


class UserResponses(Base):
    __tablename__ = 'UserResponses'

    response_id = Column(Integer, primary_key=True, index=True)
    image_path = Column(Text, nullable=False)
    model_used = Column(Text, nullable=False)
    is_right = Column(Boolean, nullable=False)
    comment = Column(Text, nullable=True)
    added_at = Column(DateTime, default=func.now())
    is_verified = Column(Boolean, nullable=True)
    verified_by = Column(Text, ForeignKey(
        "AdminAccounts.login_name"), default=None)

    verifier = relationship(
        'AdminAccounts', back_populates='verified_responses', lazy='selectin')
