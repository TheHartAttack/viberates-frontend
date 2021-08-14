import React, {useEffect, useContext} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {withRouter, Redirect, useParams, Link} from "react-router-dom"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes, faArrowRight} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"
import AlbumProfile from "./AlbumProfile"

function AddReview(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {artist, album} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    albumData: {},
    title: "",
    summary: "",
    review: "",
    tags: [],
    rating: 0,
    submitting: false,
    loading: true
  })

  if (!appState.loggedIn || appState.user.suspended) {
    return <Redirect to={`/music/${artist}/${album}`} />
  }

  useEffect(() => {
    async function getAlbum() {
      cancelPreviousRequest()

      try {
        setState(draft => {
          draft.loading = true
        })
        const response = await Axios.get(`/artist/${artist}/album/${album}`, {cancelToken: newCancelToken()})

        if (response.data.success) {
          response.data.album.releaseDate = new Date(response.data.album.releaseDate)

          setState(draft => {
            draft.albumData = response.data.album
            draft.loading = false
          })
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
          draft.loading = false
        })
        console.log(e)
      }
    }
    getAlbum()
  }, [artist, album])

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    cancelPreviousRequest()

    setState(draft => {
      draft.submitting = true
    })
    try {
      const response = await Axios.post(`/add-review/${artist}/${album}`, {title: state.title, summary: state.summary, review: state.review, tags: state.tags, rating: state.rating, token: appState.user.token}, {cancelToken: newCancelToken()})

      if (response.data.success) {
        setState(draft => {
          draft.submitting = false
        })
        appDispatch({type: "flashMessage", value: response.data.message})
        props.history.push(`/music/${artist}/${album}/${response.data.review._id}`)
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

  return (
    <Page title={`Add new review`}>
      <AlbumProfile albumData={state.albumData} artist={artist} album={album} page="add-review" />

      <form onSubmit={handleSubmit} className="form add-edit-review">
        <FormInput
          form="review"
          type="text"
          label="Title"
          name="title"
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
          onChange={e => {
            setState(draft => {
              draft.review = e.target.value
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
                    draft.tags[0] = undefined
                  }
                })
              }}
              className="form__input"
              type="text"
              name="tag"
              id="review-tag1"
              placeholder=""
            />
            <input
              onChange={e => {
                setState(draft => {
                  if (e.target.value) {
                    draft.tags[1] = e.target.value
                  } else {
                    draft.tags[1] = undefined
                  }
                })
              }}
              className="form__input"
              type="text"
              name="tag"
              id="review-tag2"
              placeholder=""
            />
            <input
              onChange={e => {
                setState(draft => {
                  if (e.target.value) {
                    draft.tags[2] = e.target.value
                  } else {
                    draft.tags[2] = undefined
                  }
                })
              }}
              className="form__input"
              type="text"
              name="tag"
              id="review-tag3"
              placeholder=""
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
          <Link to={`/music/${artist}/${album}`} className="button button--cancel">
            Cancel <FontAwesomeIcon icon={faTimes} />
          </Link>

          <FormSubmit disabled={state.submitting}>
            Post review
            <FontAwesomeIcon icon={faArrowRight} />
          </FormSubmit>
        </div>
      </form>
    </Page>
  )
}

export default withRouter(AddReview)
