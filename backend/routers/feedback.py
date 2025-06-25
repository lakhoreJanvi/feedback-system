from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from backend import models, schemas, database, auth
from sqlalchemy.orm import joinedload
from ..schemas import CommentBody
from datetime import datetime

router = APIRouter(prefix="/feedback", tags=["Feedback"])

# Manager submits feedback
@router.post("/", response_model=schemas.FeedbackOut)
def create_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_manager)
):
    employee = db.query(models.User).filter(models.User.id == feedback.employee_id).first()
    if not employee or employee.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only give feedback to your own team members")

    new_feedback = models.Feedback(
        manager_id = current_user.id,
        employee_id = feedback.employee_id,
        strengths = feedback.strengths,
        improvements = feedback.improvements,
        sentiment = feedback.sentiment
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback

# Manager views feedback they gave
@router.get("/given", response_model=list[schemas.FeedbackOut])
def get_given_feedback(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_manager)
):
    feedbacks = db.query(models.Feedback).options(joinedload(models.Feedback.employee),joinedload(models.Feedback.manager),joinedload(models.Feedback.comments)).filter(models.Feedback.manager_id == current_user.id).all()
    return feedbacks

# Employee views feedback they received
@router.get("/received", response_model=list[schemas.FeedbackOut])
def get_received_feedback(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_employee)
):
    print("Current user:", current_user.id)
    feedbacks = db.query(models.Feedback).options(joinedload(models.Feedback.employee),joinedload(models.Feedback.manager),joinedload(models.Feedback.comments)).filter(models.Feedback.employee_id == current_user.id).all()
    return feedbacks

# Manager edits feedback they created
@router.put("/{feedback_id}", response_model=schemas.FeedbackOut)
def update_feedback(
    feedback_id: int,
    update: schemas.FeedbackBase,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_manager)
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not feedback or feedback.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this feedback")

    feedback.strengths = update.strengths
    feedback.sentiment = update.sentiment
    feedback.improvements = update.improvements
    db.commit()
    db.refresh(feedback)
    return feedback

# Employee acknowledges feedback
@router.post("/{feedback_id}/acknowledge", response_model=schemas.FeedbackOut)
def acknowledge_feedback(
    feedback_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_employee)
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not feedback or feedback.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to acknowledge this feedback")

    feedback.acknowledged = True
    db.commit()
    db.refresh(feedback)
    return feedback

@router.get("/team", response_model=list[schemas.FeedbackOut])
def get_team_feedback(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Not authorized")
    team_members = db.query(models.User).filter(models.User.manager_id == current_user.id).all()
    team_ids = [employee.id for employee in team_members]

    if not team_ids:
        return []

    feedbacks = db.query(models.Feedback).filter(models.Feedback.employee_id.in_(team_ids)).all()
    return feedbacks

@router.post("/feedback-request/", response_model=schemas.FeedbackRequestOut)
def request_feedback(
    request: schemas.FeedbackRequestCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can request feedback.")

    feedback_request = models.FeedbackRequest(
        employee_id=current_user.id,
        manager_id=request.manager_id,
        status="pending"
    )
    db.add(feedback_request)
    db.commit()
    db.refresh(feedback_request)
    return feedback_request

@router.get("/feedback-requests/", response_model=list[schemas.FeedbackRequestOut])
def get_feedback_requests(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == "manager":
        return db.query(models.FeedbackRequest).filter_by(manager_id=current_user.id).all()
    else:
        return db.query(models.FeedbackRequest).filter_by(employee_id=current_user.id).all()

@router.post("/{feedback_id}/comment")
def comment_on_feedback(
    feedback_id: int,
    body: CommentBody,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    feedback = db.query(models.Feedback).get(feedback_id)
    if not feedback or feedback.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    new_comment = models.FeedbackComment(
        feedback_id=feedback_id,
        commenter_id=current_user.id,
        comments=body.comments,
        created_at=datetime.utcnow()
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return {"message": "Comment added", "comment_id": new_comment.id}
