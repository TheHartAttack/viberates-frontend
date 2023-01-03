import React, {useEffect, useContext, useRef} from "react"
import {withRouter} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faPlus, faPlusCircle, faTimes, faMinusCircle, faSave} from "@fortawesome/free-solid-svg-icons"
import Select from "react-select"

//Contexts
import AlbumProfileStateContext from "../contexts/AlbumProfileStateContext"
import AlbumProfileDispatchContext from "../contexts/AlbumProfileDispatchContext"

//Components
import FormSubmit from "./form/FormSubmit"

function AddReview() {
  const albumProfileState = useContext(AlbumProfileStateContext)
  const albumProfileDispatch = useContext(AlbumProfileDispatchContext)
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
    albumProfileDispatch({type: "submitAddReview"})
  }

  function addTag(e) {
    e.preventDefault()
    if (tagInput.current.value) {
      albumProfileDispatch({type: "addReviewTagAdd", data: tagInput.current.value})

      if (tagInput.current) {
        tagInput.current.value = ""
      }
    }
  }

  function removeTag(e, index) {
    e.preventDefault()
    albumProfileDispatch({type: "addReviewTagRemove", data: index})
  }

  function searchKeypressHandler(e) {
    e.preventDefault()
    if (e.keyCode == 27) {
      albumProfileDispatch({type: "finishAddReview"})
    }
    if (document.activeElement == tagInput.current && e.keyCode == 13 && !e.shiftKey) {
      addTag(e)
    }
  }

  return (
    <>
      <button
        className="add-review__close"
        onClick={e => {
          albumProfileDispatch({type: "finishAddReview"})
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <form onSubmit={handleSubmit} className="add-review__form" encType="multipart/form-data">
        <h3 className="add-review__heading">
          Add new review for <span className="add-review__heading-album">{albumProfileState.albumData.title}</span> by <span className="add-review__heading-artist">{albumProfileState.albumData.artist.name}</span>
        </h3>

        <div className="add-review__summary form__group">
          <label className="form__label" htmlFor="add-review-summary">
            Summary
          </label>
          <textarea
            autoComplete="off"
            className="form__input"
            id="add-review-summary"
            maxLength="256"
            onChange={e => {
              albumProfileDispatch({type: "setAddReviewSummary", data: e.target.value})
            }}
            placeholder=""
            value={albumProfileState.addReview.summary}
          ></textarea>
        </div>

        <div className="add-review__review form__group">
          <label className="form__label" htmlFor="add-review-review">
            Review
          </label>
          <textarea
            autoComplete="off"
            className="form__input"
            maxLength="99999"
            id="add-review-review"
            placeholder=""
            value={albumProfileState.addReview.review}
            onChange={e => {
              albumProfileDispatch({type: "setAddReviewReview", data: e.target.value})
            }}
          ></textarea>
        </div>

        <div className="add-review__rating form__group">
          <label className="form__label" htmlFor="add-review-rating">
            Rating
          </label>
          <Select
            value={ratingOptions.filter(option => option.value == albumProfileState.addReview.rating)}
            placeholder="-"
            onChange={selected => {
              albumProfileDispatch({type: "setAddReviewRating", data: selected.value})
            }}
            options={[
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
            ]}
          />
        </div>

        <div className="form__group add-review__tags">
          <label className="form__label" htmlFor="album-tags">
            Genre Tags
          </label>

          {Boolean(albumProfileState.addReview.tags.length) && (
            <ul className="add-review__tags-list">
              {albumProfileState.addReview.tags.map((tag, index) => {
                return (
                  <li className="add-review__tags-tag" key={index}>
                    <span className="add-review__tags-name">{tag}</span>
                    <button
                      type="button"
                      className="button add-review__tags-remove"
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

          {Boolean(albumProfileState.addReview.tags.length < 3) && (
            <div className="add-review__tags-input-wrapper">
              <input
                type="text"
                className="add-review__tags-input form__input"
                placeholder="Add a tag..."
                autoComplete="off"
                ref={tagInput}
                onKeyDown={e => {
                  if (e.keyCode == 13) {
                    e.preventDefault()
                  }
                }}
              />
              <button type="button" className="button add-review__tags-add" onClick={addTag}>
                <FontAwesomeIcon icon={faPlusCircle} />
              </button>
            </div>
          )}
        </div>

        <div className="add-review__buttons">
          <button
            className="button add-review__button add-review__button--cancel"
            type="button"
            onClick={e => {
              albumProfileDispatch({type: "finishAddReview"})
            }}
          >
            <span>Cancel</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <FormSubmit className="add-review__button add-review__button--submit add-review__submit" icon={faSave} submitting={albumProfileState.addReview.submitting} disabled={!albumProfileState.addReview.summary || !albumProfileState.addReview.rating}>
            <span>Save</span>
          </FormSubmit>
        </div>
      </form>
    </>
  )
}

export default withRouter(AddReview)
