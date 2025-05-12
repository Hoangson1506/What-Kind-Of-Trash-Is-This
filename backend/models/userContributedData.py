from sqlalchemy import Integer, Column, DateTime, Text, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base


class UserContributedData(Base):
    __tablename__ = 'UserContributedData'

    data_id = Column(Integer, primary_key=True, index=True)
    image_str = Column(Text, nullable=False)
    trash_types = Column(Text)
    bboxes = Column(Text)
    added_at = Column(DateTime, default=func.now())
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("AdminAccounts.admin_id"), default=None)

    verifier = relationship('AdminAccounts', back_populates='verified_data')