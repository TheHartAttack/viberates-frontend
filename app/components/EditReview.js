import React, {useEffect, useContext, useRef} from "react"
import {withRouter} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage, faTrashAlt, faFileUpload, faSave, faTimes, faMinusCircle, faPlus, faPlusCircle} from "@fortawesome/free-solid-svg-icons"
import Select from "react-select"

//Contexts
import ReviewStateContext from "../contexts/ReviewStateContext"
import ReviewDispatchContext from "../contexts/ReviewDispatchContext"

//Components
import FormSubmit from "./form/FormSubmit"

function EditReview() {
  const reviewState = useContext(ReviewStateContext)
  const reviewDispatch = useContext(ReviewDispatchContext)
  const tagInput = useRef("")
  const ratingOptions = [
    {value: 1, label: "1"},
    {value: 2, label: "2"},
    {value: 3, label: "3"},
    {value: 4, label: "4"},
    {value: 5, label: "5"},
    {value: 6, label: "6"},
    {value: 7, label: "7"},
    {value: 8, label: "8"},
    {value: 9, label: "9"},
    {value: 10, label: "10"}
  ]

  useEffect(() => {
    document.addEventListener("keyup", searchKeypressHandler)
    return () => {
      document.removeEventListener("keyup", searchKeypressHandler)
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    reviewDispatch({type: "submitEditReview"})
  }

  function addTag(e) {
    e.preventDefault()
    if (tagInput.current.value) {
      reviewDispatch({type: "editReviewTagAdd", data: tagInput.current.value})

      if (tagInput.current) {
        tagInput.current.value = ""
      }
    }
  }

  function removeTag(e, index) {
    e.preventDefault()
    reviewDispatch({type: "editReviewTagRemove", data: index})
  }

  function searchKeypressHandler(e) {
    e.preventDefault()
    if (e.keyCode == 27) {
      reviewDispatch({type: "closeEditReview"})
    }
    if (document.activeElement == tagInput.current && e.keyCode == 13 && !e.shiftKey) {
      addTag(e)
    }
  }

  return (
    <>
      <button
        className="edit-review__close"
        onClick={e => {
          reviewDispatch({type: "finishEditing"})
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <form onSubmit={handleSubmit} className="edit-review__form" encType="multipart/form-data">
        <h3 className="edit-review__heading">
          Edit your review of <span className="edit-review__heading-album">{reviewState.reviewData.album.title}</span> by <span className="edit-review__heading-artist">{reviewState.reviewData.album.artist.name}</span>
        </h3>

        <div className="edit-review__summary form__group">
          <label className="form__label" htmlFor="edit-review-summary">
            Summary
          </label>
          <textarea
            autoComplete="off"
            className="form__input"
            id="edit-review-summary"
            maxLength="256"
            onChange={e => {
              reviewDispatch({type: "setEditReviewSummary", data: e.target.value})
            }}
            placeholder=""
            value={reviewState.edit.summary}
          ></textarea>
        </div>

        <div className="edit-review__review form__group">
          <label className="form__label" htmlFor="edit-review-review">
            Review
          </label>
          <textarea
            autoComplete="off"
            className="form__input"
            maxLength="99999"
            id="edit-review-review"
            placeholder=""
            value={reviewState.edit.review}
            onChange={e => {
              reviewDispatch({type: "setEditReviewReview", data: e.target.value})
            }}
          ></textarea>
        </div>

        <div className="edit-review__rating form__group">
          <label className="form__label" htmlFor="edit-review-rating">
            Rating
          </label>
          <Select
            value={ratingOptions.filter(option => option.value == reviewState.edit.rating)}
            defaultValue={{value: 1, label: "1"}}
            placeholder="-"
            onChange={selected => {
              reviewDispatch({type: "setEditReviewRating", data: selected.value})
            }}
            options={ratingOptions}
          />
        </div>

        <div className="form__group edit-review__tags">
          <label className="form__label" htmlFor="album-tags">
            Genre Tags
          </label>

          {Boolean(reviewState.edit.tags.length) && (
            <ul className="edit-review__tags-list">
              {reviewState.edit.tags.map((tag, index) => {
                return (
                  <li className="edit-review__tags-tag" key={index}>
                    <span className="edit-review__tags-name">{tag}</span>
                    <button
                      type="button"
                      className="button edit-review__tags-remove"
                      onClick={e => {
                        removeTag(e, index)
                      }}
                    >
                      <FontAwesomeIcon icon={faMinusCircle} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {Boolean(reviewState.edit.tags.length < 3) && (
            <div className="edit-review__tags-input-wrapper">
              <input
                type="text"
                className="edit-review__tags-input form__input"
                placeholder="Add a tag..."
                autoComplete="off"
                ref={tagInput}
                onKeyDown={e => {
                  if (e.keyCode == 13) {
                    e.preventDefault()
                  }
                }}
              />
              <button type="button" className="button edit-review__tags-add" onClick={addTag}>
                <FontAwesomeIcon icon={faPlusCircle} />
              </button>
            </div>
          )}
        </div>

        <div className="edit-review__buttons">
          <button
            className="button edit-review__button edit-review__button--cancel"
            type="button"
            onClick={e => {
              reviewDispatch({type: "closeEditReview"})
              resetEditData()
            }}
          >
            <span>Cancel</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <FormSubmit className="edit-review__button edit-review__button--submit" icon={faSave} submitting={reviewState.edit.submitting} disabled={!reviewState.edit.summary || !reviewState.edit.rating}>
            <span>Save</span>
          </FormSubmit>
        </div>
      </form>
    </>
  )
}

export default withRouter(EditReview)
