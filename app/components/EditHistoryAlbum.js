import React, {useEffect, useContext} from "react"
import {Link, useParams} from "react-router-dom"
import {useImmer} from "use-immer"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUndoAlt} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import AlbumProfile from "./AlbumProfile"

function EditHistoryAlbum() {
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
        setState(draft => {
          draft.loading = false
        })
        console.log(e)
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
          draft.albumData.type = response.data.edit.data.type
          draft.albumData.image = response.data.edit.data.image
          draft.albumData.releaseDate = response.data.edit.data.releaseDate
        })

        appDispatch({type: "flashMessage", value: response.data.message})

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
      <AlbumProfile albumData={state.albumData} artist={artist} album={album} page="album-edit-history" />

      {Boolean(state.editHistory.length) && (
        <div className="edit-history">
          <h3 className="edit-history__title">Edit History</h3>
          {state.editHistory.map(item => {
            return (
              <div className="edit-history__item" key={item._id}>
                <span className="edit-history__header">
                  {item.initial ? "Added" : "Edited"} by{" "}
                  <Link className="edit-history__user" to={`/user/${item.user.slug}`}>
                    {item.user.username}
                  </Link>{" "}
                  on{" "}
                  <span className="edit-history__date">
                    {item.date.getDate()}/{item.date.getMonth() + 1}/{item.date.getFullYear()}
                  </span>{" "}
                  at{" "}
                  <span className="edit-history__time">
                    {item.date.getHours()}:{String(item.date.getMinutes()).padStart(2, "0")}
                  </span>
                </span>

                <div className="edit-history__body">
                  <div className="edit-history__image">
                    <span className="edit-history__change-data">
                      <img src={item.data.image} alt={item.data.name ? item.data.name : item.data.title} />
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
                </div>

                {(item.data.title != state.albumData.title || item.data.releaseDate.getDate() != state.albumData.releaseDate.getDate() || item.data.releaseDate.getMonth() != state.albumData.releaseDate.getMonth() || item.data.releaseDate.getFullYear() != state.albumData.releaseDate.getFullYear() || item.data.label != state.albumData.label || item.data.type != state.albumData.type || item.data.image != state.albumData.image) && (
                  <div className="edit-history__footer">
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
                          <span>Revert</span> <FontAwesomeIcon icon={faUndoAlt} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {state.moreResults && (
            <button onClick={e => loadMore(e)} className="edit-history__more" disabled={state.loadingMoreResults}>
              {state.loadingMoreResults ? <Loading fontSize="12" /> : "Load more"}
            </button>
          )}
        </div>
      )}
    </Page>
  )
}

export default EditHistoryAlbum
