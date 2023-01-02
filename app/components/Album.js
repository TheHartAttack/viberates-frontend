import React, {useEffect, useContext} from "react"
import {Link, Redirect, useParams, withRouter} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowRight} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import AlbumStateContext from "../contexts/AlbumStateContext"
import AlbumDispatchContext from "../contexts/AlbumDispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import AlbumProfileContext from "./AlbumProfileContext"

function Album(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const albumState = useContext(AlbumStateContext)
  const albumDispatch = useContext(AlbumDispatchContext)
  const {artist, album} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()

  useEffect(() => {
    if (appState.size == "medium" || appState.size == "large" || appState.size == "huge") {
      albumDispatch({type: "setColNum", data: 2})
    } else {
      albumDispatch({type: "setColNum", data: 1})
    }
  }, [appState.size])

  useEffect(() => {
    async function getAlbum() {
      cancelPreviousRequest()

      try {
        const response = await Axios.get(`/artist/${artist}/album/${album}`, {cancelToken: newCancelToken()})

        if (response.data.success) {
          response.data.album.releaseDate = new Date(response.data.album.releaseDate)
          response.data.album.reviews.forEach(review => {
            review.date = new Date(review.date)
          })

          albumDispatch({type: "setAlbumData", data: response.data.album})
          albumDispatch({type: "finishLoading"})
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
        props.history.push(`/music/${artist}`)
      }
    }
    getAlbum()
  }, [album])

  if (albumState.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  return (
    <Page title={`${albumState.albumData.artist.name} - ${albumState.albumData.title}`}>
      <AlbumProfileContext artist={artist} album={album} page="album" albumData={albumState.albumData} />

      {Boolean(albumState.albumData.reviews.length) && (
        <div className="album-reviews">
          <h3 className="album-reviews__title">Reviews</h3>
          <div className="album-reviews__column">
            {albumState.albumData.reviews.map((review, index) => {
              if (index % albumState.colNum == 0) {
                return (
                  <div className="album-reviews__review" key={review._id}>
                    <div className="album-reviews__body">{review.summary}</div>

                    <span className="album-reviews__rating">{review.rating}</span>

                    <span className="album-reviews__posted">
                      Posted by&nbsp;
                      <Link to={`/user/${review.author.slug}`} className="album-reviews__author">
                        {review.author.username}
                      </Link>
                      &nbsp;on&nbsp;<span className="album-reviews__date">{`${review.date.getDate()}/${review.date.getMonth() + 1}/${review.date.getFullYear()}`}</span>
                    </span>
                    <Link to={`/music/${artist}/${album}/${review._id}`} className="album-reviews__link">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>
                )
              }
            })}
          </div>
          <div className="album-reviews__column">
            {albumState.albumData.reviews.map((review, index) => {
              if (index % albumState.colNum == 1) {
                return (
                  <div className="album-reviews__review" key={review._id}>
                    <div className="album-reviews__body">{review.summary}</div>

                    <span className="album-reviews__rating">{review.rating}</span>

                    <span className="album-reviews__posted">
                      Posted by&nbsp;
                      <Link to={`/user/${review.author.slug}`} className="album-reviews__author">
                        {review.author.username}
                      </Link>
                      &nbsp;on&nbsp;<span className="album-reviews__date">{`${review.date.getDate()}/${review.date.getMonth() + 1}/${review.date.getFullYear()}`}</span>
                    </span>
                    <Link to={`/music/${artist}/${album}/${review._id}`} className="album-reviews__link">
                      Read
                    </Link>
                  </div>
                )
              }
            })}
          </div>
        </div>
      )}
    </Page>
  )
}

export default withRouter(Album)
