import React, {useEffect, useContext} from "react"
import {withRouter, useParams, Link} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes, faSave} from "@fortawesome/free-solid-svg-icons"

//Components
import Page from "./Page"
import Loading from "./Loading"
import AlbumProfileContext from "./AlbumProfileContext"
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function EditReview(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const {artist, album, review} = useParams()

  // useEffect(() => {
  //   async function getReview() {
  //     cancelPreviousRequest()

  //     try {
  //       const response = await Axios.get(`/artist/${artist}/album/${album}/review/${review}`, {cancelToken: newCancelToken()})

  //       if (response.data.success) {
  //         response.data.review.date = new Date(response.data.review.date)
  //         response.data.review.album.releaseDate = new Date(response.data.review.album.releaseDate)
  //         response.data.review.tags = response.data.review.tags.map(tag => {
  //           return tag.name
  //         })

  //         setState(draft => {
  //           draft.title = response.data.review.title
  //           draft.summary = response.data.review.summary
  //           draft.reviewBody = response.data.review.review
  //           draft.tags = response.data.review.tags
  //           draft.rating = response.data.review.rating
  //           draft.reviewAlbum = response.data.review.album
  //           draft.loading = false
  //         })
  //       } else {
  //         throw new Error(response.data.message)
  //       }
  //     } catch (e) {
  //       if (isCancel(e)) {
  //         console.log(e)
  //         return
  //       }
  //       appDispatch({type: "flashMessage", value: e.message, warning: true})
  //       // setState(draft => {
  //       //   draft.loading = false
  //       // })
  //       console.log(e)
  //     }
  //   }
  //   getReview()
  // }, [artist, album, review])

  async function handleSubmit(e) {
    e.preventDefault()
    cancelPreviousRequest()

    setState(draft => {
      draft.submitting = true
    })
    try {
      const response = await Axios.post(
        `/edit/artist/${artist}/album/${album}/review/${review}`,
        {
          title: state.title,
          summary: state.summary,
          review: state.reviewBody,
          tags: state.tags,
          rating: state.rating,
          token: appState.user.token
        },
        {cancelToken: newCancelToken()}
      )

      if (response.data.success) {
        appDispatch({type: "flashMessage", value: response.data.message})
        setState(draft => {
          draft.submitting = false
        })
        props.history.push(`/music/${artist}/${album}/${review}`)
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

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  return (
    <Page title="Edit Review">
      <AlbumProfileContext albumData={state.reviewAlbum} artist={artist} album={album} page="edit-review" />

      <form onSubmit={handleSubmit} className="form add-edit-review">
        <FormInput
          form="review"
          type="text"
          label="Title"
          name="title"
          value={state.title}
          onChange={e => {
            setState(draft => {
              draft.title = e.target.value
            })
          }}
        />
        <FormInput
          form="review"
          type="textarea"
          label="Summary"
          name="summary"
          value={state.summary}
          onChange={e => {
            setState(draft => {
              draft.summary = e.target.value
            })
          }}
        />
        <FormInput
          form="review"
          type="textarea"
          label="Review"
          name="review"
          className="tall"
          value={state.reviewBody}
          onChange={e => {
            setState(draft => {
              draft.reviewBody = e.target.value
            })
          }}
        />
        <div className="form__group form__group--narrow">
          <label className="form__label" htmlFor="review-tag">
            Genre Tags
          </label>
          <div className="form__inner-group">
            <input
              onChange={e => {
                setState(draft => {
                  if (e.target.value) {
                    draft.tags[0] = e.target.value
                  } else {
                    draft.tags.splice(0, 1)
                  }
                })
              }}
              className="form__input form__input--tag"
              type="text"
              name="tag"
              id="review-tag1"
              placeholder=""
              value={state.tags[0] ? state.tags[0] : ""}
            />
            <input
              onChange={e => {
                setState(draft => {
                  if (e.target.value) {
                    draft.tags[1] = e.target.value
                  } else {
                    draft.tags.splice(1, 1)
                  }
                })
              }}
              className="form__input form__input--tag"
              type="text"
              name="tag"
              id="review-tag2"
              placeholder=""
              value={state.tags[1] ? state.tags[1] : ""}
            />
            <input
              onChange={e => {
                setState(draft => {
                  if (e.target.value) {
                    draft.tags[2] = e.target.value
                  } else {
                    draft.tags.splice(2, 1)
                  }
                })
              }}
              className="form__input form__input--tag"
              type="text"
              name="tag"
              id="review-tag3"
              placeholder=""
              value={state.tags[2] ? state.tags[2] : ""}
            />
          </div>
        </div>

        <FormInput
          form="review"
          type="select"
          label="Rating"
          name="rating"
          className="narrow"
          value={state.rating}
          options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          onChange={e => {
            setState(draft => {
              draft.rating = parseInt(e.target.value)
            })
          }}
        />

        <div className="form__buttons">
          <Link to={`/music/${artist}/${album}/${review}`} className="button button--cancel">
            Cancel <FontAwesomeIcon icon={faTimes} />
          </Link>

          <FormSubmit disabled={state.submitting}>
            Save changes <FontAwesomeIcon icon={faSave} />
          </FormSubmit>
        </div>
      </form>
    </Page>
  )
}

export default withRouter(EditReview)
