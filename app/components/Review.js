import React, {useEffect, useContext} from "react"
import {Link, Redirect, useParams, withRouter} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import ReactMarkdown from "react-markdown"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faEdit, faHeart as fasHeart} from "@fortawesome/free-solid-svg-icons"
import {faHeart as farHeart} from "@fortawesome/free-regular-svg-icons"

//Contexts & Reducers
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import ReviewStateContext from "../contexts/ReviewStateContext"
import ReviewDispatchContext from "../contexts/ReviewDispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import AlbumProfileContext from "./AlbumProfileContext"
import Comments from "./Comments"

function Review(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const reviewState = useContext(ReviewStateContext)
  const reviewDispatch = useContext(ReviewDispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const {artist, album, review} = useParams()

  async function handleLike(e) {
    cancelPreviousRequest()
    try {
      const response = await Axios.post(`/like/review/${review}/${reviewState.reviewData.author._id}`, {token: appState.user.token}, {cancelToken: newCancelToken()})

      if (response.data.success) {
        if (response.data.status == "likeCreated") {
          reviewDispatch({type: "addLike", data: response.data.like.user})
        } else if (response.data.status == "likeDeleted") {
          reviewDispatch({type: "removeLike", data: response.data.like.user})
        }
      } else {
        throw new Error(response.data.message)
      }
    } catch (e) {
      if (isCancel(e)) {
        console.log(e)
        return
      }
      console.log(e)
      appDispatch({type: "flashMessage", value: e.message, warning: true})
    }
  }

  if (reviewState.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  if (!reviewState.loading && !reviewState.reviewData) {
    return <Redirect to={`/music/${artist}/album/${album}`} />
  }

  return (
    <Page title={`${reviewState.reviewData.album.artist.name} - ${reviewState.reviewData.album.title}`}>
      <AlbumProfileContext albumData={reviewState.reviewData.album} artist={artist} album={album} page="review" />

      <div className="review">
        <div className="review__section review__header">
          <span className="review__posted">
            Posted by{" "}
            <Link to={`/user/${reviewState.reviewData.author.slug}`} className="review__author">
              {reviewState.reviewData.author.username}
            </Link>{" "}
            on {reviewState.reviewData.date.getDate()}/{reviewState.reviewData.date.getMonth() + 1}/{reviewState.reviewData.date.getFullYear()}
          </span>
          {appState.user.username == reviewState.reviewData.author.username && (
            <button
              className="review__edit"
              onClick={e => {
                reviewDispatch({type: "openEditReview"})
              }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          )}
          {appState.user.username != reviewState.reviewData.author.username && (
            <button onClick={handleLike} className="review__like">
              {!reviewState.reviewData.likes.includes(appState.user._id) && <FontAwesomeIcon icon={farHeart} />}
              {reviewState.reviewData.likes.includes(appState.user._id) && <FontAwesomeIcon icon={fasHeart} />}
            </button>
          )}
        </div>

        {Boolean(reviewState.reviewData.review) && (
          <div className="review__section review__body">
            <ReactMarkdown children={reviewState.reviewData.review} allowedTypes={["paragraph", "text"]} />
          </div>
        )}

        <div className="review__section review__footer">
          <div className="review__summary">{reviewState.reviewData.summary}</div>
          <div className="review__rating">
            <span>{reviewState.reviewData.rating}</span>
          </div>
        </div>

        <Comments />
      </div>
    </Page>
  )
}

export default withRouter(Review)
