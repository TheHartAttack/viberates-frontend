import React, {Suspense, useEffect, useContext} from "react"
import {Link, Redirect, useParams, withRouter} from "react-router-dom"
import {useImmerReducer} from "use-immer"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {CSSTransition} from "react-transition-group"

//Contexts & Reducers
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import ReviewStateContext from "../contexts/ReviewStateContext"
import ReviewDispatchContext from "../contexts/ReviewDispatchContext"
import ReviewReducer from "../reducers/ReviewReducer"

//Components
import Review from "./Review"
import EditReview from "./EditReview"

function ReviewContext(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const {artist, album, review} = useParams()
  const initialState = {
    loading: true,
    reviewData: null,
    updateCount: 0,
    edit: {
      active: false,
      summary: "",
      review: "",
      tags: [],
      rating: 0,
      submitting: false,
      submitCount: 0,
      deleting: false,
      deleteCount: 0
    }
  }

  const [state, dispatch] = useImmerReducer(ReviewReducer, initialState)

  useEffect(() => {
    async function getReview() {
      cancelPreviousRequest()
      try {
        const response = await Axios.get(`/artist/${artist}/album/${album}/review/${review}`, {cancelToken: newCancelToken()})

        console.log(response.data)

        if (response.data.success) {
          response.data.review.date = new Date(response.data.review.date)
          response.data.review.album.releaseDate = new Date(response.data.review.album.releaseDate)
          response.data.review.comments.map(comment => {
            comment.date = new Date(comment.date)
            comment.edit = {
              body: "",
              open: false,
              submitting: false
            }
          })

          dispatch({type: "setReviewData", data: response.data.review})
          dispatch({type: "setEditReview", data: response.data.review})
          dispatch({type: "finishLoading"})
        } else {
          throw new Error(response.data.message)
        }
      } catch (e) {
        console.log(e)
        appDispatch({type: "flashMessage", value: e.message, warning: true})
        props.history.push(`/music/${artist}/${album}`)
      }
    }
    getReview()
  }, [review, state.updateCount])

  useEffect(() => {
    if (state.edit.submitCount) {
      async function submitEditReview(e) {
        cancelPreviousRequest()

        dispatch({type: "editReviewStartSubmitting"})

        try {
          const response = await Axios.post(
            `/edit/artist/${artist}/album/${album}/review/${review}`,
            {
              summary: state.edit.summary,
              review: state.edit.review,
              tags: state.edit.tags,
              rating: state.edit.rating,
              token: appState.user.token
            },
            {cancelToken: newCancelToken()}
          )

          console.log(response.data)

          if (response.data.success) {
            if (!response.data.changes) {
              appDispatch({type: "flashMessage", value: "No changes made.", warning: true})
              dispatch({type: "finishSubmitting"})
              dispatch({type: "closeEditReview"})
            } else {
              dispatch({type: "setReviewSummary", data: state.edit.summary})
              dispatch({type: "setReviewReview", data: state.edit.review})
              dispatch({type: "setReviewRating", data: state.edit.rating})
              dispatch({type: "setReviewTags", data: state.edit.tags})

              appDispatch({type: "flashMessage", value: response.data.message})
              dispatch({type: "editReviewFinishSubmitting"})
              dispatch({type: "closeEditReview"})
              dispatch({type: "reviewUpdate"})
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
          dispatch({type: "editReviewFinishSubmitting"})
          console.log(e)
        }
      }
      submitEditReview()
    }
  }, [state.edit.submitCount])

  return (
    <ReviewStateContext.Provider value={state}>
      <ReviewDispatchContext.Provider value={dispatch}>
        <Review />
        <CSSTransition timeout={250} in={state.edit.active} classNames="edit-review" unmountOnExit>
          <div className="edit-review">
            <Suspense fallback="">
              <EditReview />
            </Suspense>
          </div>
        </CSSTransition>
      </ReviewDispatchContext.Provider>
    </ReviewStateContext.Provider>
  )
}

export default withRouter(ReviewContext)
