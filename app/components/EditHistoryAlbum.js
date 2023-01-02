import React, {useEffect, useContext} from "react"
import {Link, Redirect, useParams, withRouter} from "react-router-dom"
import {useImmer} from "use-immer"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUndoAlt, faImage, faEllipsisH} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import AlbumProfileContext from "./AlbumProfileContext"

function EditHistoryAlbum(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const {artist, album} = useParams()
  const [state, setState] = useImmer({
    loading: true,
    albumData: {},
    editHistory: [],
    moreResults: false,
    loadingMoreResults: false
  })

  useEffect(() => {
    async function getEdits() {
      cancelPreviousRequest()

      try {
        const response = await Axios.post(
          `edit-history/artist/${artist}/album/${album}`,
          {
            offset: state.editHistory.length
          },
          {cancelToken: newCancelToken()}
        )

        if (response.data.success) {
          response.data.editHistory.map(item => {
            item.date = new Date(item.date)
            item.data.releaseDate = new Date(item.data.releaseDate)
            item.submitting = false
          })
          response.data.album.releaseDate = new Date(response.data.album.releaseDate)

          setState(draft => {
            draft.loading = false
            draft.albumData = response.data.album
            draft.editHistory = response.data.editHistory
            draft.moreResults = response.data.moreResults
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
        console.log(e)
        props.history.push(`/music/${artist}/${album}`)
      }
    }
    getEdits()
  }, [])

  async function revert(id) {
    cancelPreviousRequest()

    const index = state.editHistory.findIndex(item => {
      return item._id == id
    })

    try {
      setState(draft => {
        draft.editHistory[index].loading = true
      })

      const response = await Axios.post(
        "/revert/album",
        {
          editId: id,
          token: appState.user.token
        },
        {cancelToken: newCancelToken()}
      )

      if (response.data.success) {
        response.data.edit.date = new Date(response.data.edit.date)
        response.data.edit.data.releaseDate = new Date(response.data.edit.data.releaseDate)

        setState(draft => {
          draft.editHistory[index].loading = false
          draft.editHistory.unshift(response.data.edit)
          draft.albumData.title = response.data.edit.data.title
          draft.albumData.slug = response.data.edit.data.slug
          draft.albumData.type = response.data.edit.data.type
          draft.albumData.image = response.data.edit.data.image
          draft.albumData.releaseDate = response.data.edit.data.releaseDate
          draft.albumData.tracklist = response.data.edit.data.tracklist
        })

        appDispatch({type: "flashMessage", value: response.data.message})
        props.history.push(`/history/${artist}/${response.data.edit.data.slug}`)
        window.scrollTo(0, 0)
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
      setState(draft => {
        draft.editHistory[index].loading = false
      })
    }
  }

  async function loadMore() {
    cancelPreviousRequest()

    try {
      setState(draft => {
        draft.loadingMoreResults = true
      })

      const response = await Axios.post(
        `edit-history/artist/${artist}/album/${album}`,
        {
          offset: state.editHistory.length
        },
        {cancelToken: newCancelToken()}
      )

      if (response.data.success) {
        response.data.editHistory.map(item => {
          item.date = new Date(item.date)
          item.data.releaseDate = new Date(item.data.releaseDate)
          item.submitting = false
        })
        response.data.album.releaseDate = new Date(response.data.album.releaseDate)

        setState(draft => {
          draft.loadingMoreResults = false
          draft.editHistory = state.editHistory.concat(response.data.editHistory)
          draft.moreResults = response.data.moreResults
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
      console.log(e)
      setState(draft => {
        draft.loadingMoreResults = false
      })
    }
  }

  if (!appState.user.token || appState.user.suspended) {
    return <Redirect to={`/music/${artist}/${album}`} />
  }

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  return (
    <Page title={`${state.albumData.artist.name} - ${state.albumData.title}`}>
      <AlbumProfileContext albumData={state.albumData} artist={artist} album={album} page="history" setEditHistoryState={setState} />

      {Boolean(state.editHistory.length) && (
        <div className="edit-history">
          <h3 className="edit-history__title">Edit History</h3>
          {state.editHistory.map(item => {
            return (
              <div className="edit-history__item" key={item._id}>
                <span className="edit-history__header">
                  <span className="edit-history__by">
                    {item.initial ? "Added" : "Edited"} by{" "}
                    <Link className="edit-history__user" to={`/user/${item.user.slug}`}>
                      {item.user.username}
                    </Link>{" "}
                  </span>

                  <span className="edit-history__on">
                    <span className="edit-history__date">
                      {item.date.getDate()}/{item.date.getMonth() + 1}/{item.date.getFullYear()}
                    </span>{" "}
                    at{" "}
                    <span className="edit-history__time">
                      {item.date.getHours()}:{String(item.date.getMinutes()).padStart(2, "0")}
                    </span>
                  </span>

                  {(item.data.title != state.albumData.title || item.data.releaseDate.getDate() != state.albumData.releaseDate.getDate() || item.data.releaseDate.getMonth() != state.albumData.releaseDate.getMonth() || item.data.releaseDate.getFullYear() != state.albumData.releaseDate.getFullYear() || item.data.type != state.albumData.type || item.data.image != state.albumData.image) && (
                    <button
                      onClick={e => {
                        revert(item._id)
                      }}
                      className="edit-history__revert button"
                      disabled={item.loading}
                    >
                      {item.loading ? (
                        <Loading fontSize="16" />
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faUndoAlt} />
                        </>
                      )}
                    </button>
                  )}
                </span>

                <div className="edit-history__body">
                  <div className="edit-history__image">
                    <span className="edit-history__change-data">
                      {Boolean(item.data.image) ? (
                        <img src={item.data.image} alt={item.data.name ? item.data.name : item.data.title} />
                      ) : (
                        <div className="edit-history__placeholder">
                          <FontAwesomeIcon icon={faImage} />
                        </div>
                      )}
                    </span>
                  </div>

                  <div className="edit-history__details">
                    <div className="edit-history__change">
                      <span className="edit-history__change-label">Title: </span>
                      <span className="edit-history__change-data">{item.data.title ? item.data.title : ""}</span>
                    </div>

                    <div className="edit-history__change">
                      <span className="edit-history__change-label">Release Date: </span>
                      <span className="edit-history__change-data">
                        {item.data.releaseDate.getDate()}/{item.data.releaseDate.getMonth() + 1}/{item.data.releaseDate.getFullYear()}
                      </span>
                    </div>

                    <div className="edit-history__change">
                      <span className="edit-history__change-label">Type: </span>
                      <span className="edit-history__change-data">{item.data.type ? item.data.type : "-"}</span>
                    </div>
                  </div>

                  {Boolean(item.data.tracklist?.length) && (
                    <div className="edit-history__change edit-history__change--tracklist">
                      <span className="edit-history__change-label">Tracklist: </span>
                      <ol className="edit-history__tracklist">
                        {item.data.tracklist?.map((track, index) => {
                          return (
                            <li key={index} className="edit-history__track">
                              <span>{track}</span>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {state.moreResults && (
            <button onClick={e => loadMore(e)} className="edit-history__more" disabled={state.loadingMoreResults}>
              Load more
              {state.loadingMoreResults ? <Loading fontSize="12" className="edit-history" /> : <FontAwesomeIcon icon={faEllipsisH} />}
            </button>
          )}
        </div>
      )}
    </Page>
  )
}

export default withRouter(EditHistoryAlbum)
