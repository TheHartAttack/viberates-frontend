import React, {useEffect, useContext, useRef} from "react"
import {Link, useParams} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"
import TextAreaAutosize from "react-textarea-autosize"
import moment from "moment"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUser, faThumbsUp as fasThumbsUp, faEdit, faTimes, faSave, faCompactDisc, faArrowRight} from "@fortawesome/free-solid-svg-icons"
import {faThumbsUp as farThumbsUp} from "@fortawesome/free-regular-svg-icons"

//Contexts & Reducers
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import ReviewStateContext from "../contexts/ReviewStateContext"
import ReviewDispatchContext from "../contexts/ReviewDispatchContext"

//Components
import Loading from "./Loading"

function Comments() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const reviewState = useContext(ReviewStateContext)
  const reviewDispatch = useContext(ReviewDispatchContext)
  const commentInput = useRef(null)
  const {review} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    commentBody: "",
    submitting: false,
    submitCount: 0
  })

  useEffect(() => {
    if (state.submitCount) {
      async function addComment() {
        cancelPreviousRequest()

        try {
          setState(draft => {
            draft.submitting = true
          })

          const response = await Axios.post(`/add-comment/${review}`, {comment: state.commentBody, token: appState.user.token}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            response.data.body.date = new Date(response.data.body.date)
            response.data.body.edit = {
              body: "",
              open: false,
              submitting: false
            }

            reviewDispatch({type: "addComment", data: response.data.body})

            appDispatch({type: "flashMessage", value: response.data.message})

            setState(draft => {
              draft.submitting = false
              draft.commentBody = ""
            })
            commentInput.current.value = ""
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          setState(draft => {
            draft.submitting = false
          })
          console.log(e)
        }
      }
      addComment()
    }
  }, [state.submitCount])

  function handleKeyPress(e) {
    if (e.key == "Enter" && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  function cancelComment(e) {
    setState(draft => {
      draft.commentBody = ""
    })
    commentInput.current.value = ""
  }

  function toggleEdit(targetComment) {
    if (!targetComment.edit.open) {
      reviewDispatch({type: "openEdit", data: targetComment})
    } else {
      reviewDispatch({type: "closeEdit", data: targetComment})
    }
  }

  function setEditBody(targetComment, editBody) {
    reviewDispatch({type: "setEditBody", target: targetComment, value: editBody})
  }

  async function saveEdit(targetComment) {
    cancelPreviousRequest()

    reviewDispatch({type: "startSaving", data: targetComment})

    try {
      const response = await Axios.post(`/edit-comment/comment/${targetComment._id}`, {comment: targetComment.edit.body, token: appState.user.token}, {cancelToken: newCancelToken()})

      if (response.data.success) {
        reviewDispatch({type: "saveEdit", data: targetComment})
        reviewDispatch({type: "closeEdit", data: targetComment})
        reviewDispatch({type: "finishSaving", data: targetComment})
      } else {
        throw new Error(response.data.message)
      }
    } catch (e) {
      if (isCancel(e)) {
        console.log(e)
        return
      }
      appDispatch({type: "flashMessage", value: e.message, warning: true})
      console.log(e)
      reviewDispatch({type: "closeEdit", data: targetComment})
      reviewDispatch({type: "finishSaving", data: targetComment})
    }
  }

  async function handleLike(targetComment) {
    cancelPreviousRequest()

    try {
      const response = await Axios.post(`/like/comment/${targetComment}`, {token: appState.user.token}, {cancelToken: newCancelToken()})

      if (response.data.success) {
        if (response.data.status == "likeCreated") {
          reviewDispatch({type: "addCommentLike", data: response.data.commentLike})
        } else if (response.data.status == "likeDeleted") {
          reviewDispatch({type: "removeCommentLike", data: response.data.commentLike})
        }
      } else {
        throw new Error(response.data.message)
      }
    } catch (e) {
      if (isCancel(e)) {
        console.log(e)
        return
      }
      appDispatch({type: "flashMessage", value: e.message, warning: true})
      console.log(e)
    }
  }

  function handleEditKeyPress(e, comment) {
    if (e.key == "Enter" && !e.shiftKey) {
      e.preventDefault()
      saveEdit(comment, e.target.value)
    } else if (e.key == "Escape") {
      e.preventDefault()
      toggleEdit(comment)
    }
  }

  function caretAtEnd(e) {
    const temp = e.target.value
    e.target.value = ""
    e.target.value = temp
  }

  return (
    <div className="comments">
      <form
        onSubmit={e => {
          handleSubmit(e)
        }}
        className="comments__form"
      >
        <TextAreaAutosize
          className="comments__input"
          ref={commentInput}
          placeholder="Add a comment..."
          onChange={e => {
            setState(draft => {
              draft.commentBody = e.target.value
            })
          }}
          onKeyDown={handleKeyPress}
        />
        {state.commentBody && (
          <div className="comments__buttons">
            {!state.submitting && (
              <button onClick={cancelComment} className="comments__button comments__cancel" type="button">
                Cancel
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
            <button className="comments__button comments__submit" type="submit" disabled={state.submitting || !state.commentBody ? "disabled" : ""}>
              {state.submitting ? <Loading fontSize="12" /> : "Post comment"}
              {state.submitting ? "" : <FontAwesomeIcon icon={faArrowRight} />}
            </button>
          </div>
        )}
      </form>

      {!Boolean(reviewState.reviewData.comments.length) && <span className="comments__none">No comments yet.</span>}

      {Boolean(reviewState.reviewData.comments.length) &&
        reviewState.reviewData.comments.map(comment => {
          return (
            <div className="comments__comment" key={comment._id}>
              <div className="comments__image">
                <FontAwesomeIcon className="comments__image-icon" icon={faUser} />
                {Boolean(comment.author.image) && <img className="comments__author-image" src={comment.author.image} alt={comment.author.username} />}
              </div>

              <div className="comments__header">
                <Link to={`/user/${comment.author.slug}`} className="comments__author">
                  {comment.author.username}
                </Link>

                <span className="comments__time">{moment(comment.date).calendar()}</span>
              </div>

              {!comment.edit.open && <div className="comments__body">{comment.comment}</div>}

              {comment.edit.open && (
                <form className="comments__edit">
                  <TextAreaAutosize
                    className="comments__edit-input"
                    placeholder="Add a comment..."
                    value={comment.edit.body}
                    onChange={e => {
                      setEditBody(comment, e.target.value)
                    }}
                    onKeyDown={e => {
                      handleEditKeyPress(e, comment)
                    }}
                    onFocus={e => caretAtEnd(e)}
                    autoFocus
                  />
                </form>
              )}

              <div className="comments__actions">
                {appState.loggedIn && appState.user.username != comment.author.username && (
                  <FontAwesomeIcon
                    onClick={e => {
                      handleLike(comment._id)
                    }}
                    icon={comment.likes.includes(appState.user._id) ? fasThumbsUp : farThumbsUp}
                    className="comments__icon"
                  />
                )}

                {appState.loggedIn && appState.user.username == comment.author.username && !comment.edit.submitting && (
                  <FontAwesomeIcon
                    onClick={e => {
                      toggleEdit(comment)
                    }}
                    icon={comment.edit.open ? faTimes : faEdit}
                    className="comments__icon"
                  />
                )}

                {appState.loggedIn && appState.user.username == comment.author.username && comment.edit.open && !comment.edit.submitting && (
                  <FontAwesomeIcon
                    onClick={e => {
                      saveEdit(comment)
                    }}
                    icon={faSave}
                    className="comments__icon"
                  />
                )}

                {appState.loggedIn && appState.user.username == comment.author.username && comment.edit.open && comment.edit.submitting && <FontAwesomeIcon icon={faCompactDisc} className="comments__icon comments__loading" />}
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default Comments
