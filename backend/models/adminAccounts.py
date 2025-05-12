from sqlalchemy import Integer, Column, DateTime, Text, Boolean, func
from sqlalchemy.orm import relationship
from database import Base


class AdminAccounts(Base):
    __tablename__ = 'AdminAccounts'

    admin_id = Column(Integer, primary_key=True, index=True)
    login_name = Column(Text, nullable=False)
    password = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    last_active_at = Column(DateTime, default=None)
    is_disabled = Column(Boolean, default=False)

    verified_data = relationship('UserContributedData', back_populates='verifier')
    verified_responses = relationship('UserResponses', back_populates='verifier')