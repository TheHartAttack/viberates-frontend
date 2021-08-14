import React, {useEffect, useContext} from "react"
import {Link, useParams} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowRight} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import AlbumProfile from "./AlbumProfile"

function Album() {
  const appState = useContext(StateContext)
  const {artist, album} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    albumData: {},
    colNum: 1,
    loading: true
  })

  useEffect(() => {
    if (appState.size == "medium" || appState.size == "large" || appState.size == "huge") {
      setState(draft => {
        draft.colNum = 2
      })
    } else {
      setState(draft => {
        draft.colNum = 1
      })
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
  }, [])

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  return (
    <Page title={`${state.albumData.artist.name} - ${state.albumData.title}`}>
      <AlbumProfile albumData={state.albumData} artist={artist} album={album} page="album" />
      <div className="album-reviews">
        <div className="album-reviews__column">
          {state.albumData.reviews.map((review, index) => {
            if (index % state.colNum == 0) {
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
          {state.albumData.reviews.map((review, index) => {
            if (index % state.colNum == 1) {
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
    </Page>
  )
}

export default Album
