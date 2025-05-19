from sqlalchemy import Integer, Column, DateTime, Text, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from db import Base


class WebStatistics(Base):
    __tablename__ = 'WebStatistics'

    model = Column(Text, primary_key=True)
    image_inference_count = Column(Integer, default=0)
    live_inference_count = Column(Integer, default=0)