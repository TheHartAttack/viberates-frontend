import React, {Suspense, useEffect, useContext} from "react"
import {withRouter, useParams} from "react-router-dom"
import {useImmerReducer} from "use-immer"
import Axios from "axios"
import {CSSTransition} from "react-transition-group"
import useCancelToken from "react-use-cancel-token"

//Contexts & Reducers
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import AlbumProfileStateContext from "../contexts/AlbumProfileStateContext"
import AlbumProfileDispatchContext from "../contexts/AlbumProfileDispatchContext"
import AlbumProfileReducer from "../reducers/AlbumProfileReducer"

//Components
import AlbumProfile from "./AlbumProfile"
import EditAlbum from "./EditAlbum"
import AddReview from "./AddReview"

function AlbumProfileContext({history, albumData, page, setEditHistoryState}) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {artist, album} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const initialState = {
    albumData,
    page,
    loading: true,
    userHasReviewed: false,
    edit: {
      active: false,
      title: albumData.title,
      image: albumData.image,
      preview: albumData.image,
      releaseDate: albumData.releaseDate,
      type: albumData.type,
      tracklist: albumData.tracklist?.map((track, index) => {
        return {name: track, id: `${index.toString()}${track}`}
      }),
      submitting: false,
      submitCount: 0
    },
    addReview: {
      active: false,
      summary: "",
      review: "",
      tags: [],
      rating: 1,
      submitting: false,
      submitCount: 0
    }
  }

  const [state, dispatch] = useImmerReducer(AlbumProfileReducer, initialState)

  useEffect(() => {
    if (state.edit.active) {
      document.querySelector("body").classList.add("noscroll")
    } else {
      document.querySelector("body").classList.remove("noscroll")
    }
  }, [state.edit.active])

  useEffect(() => {
    dispatch({type: "setAlbumTitle", data: albumData.title})
    dispatch({type: "setAlbumSlug", data: albumData.slug})
    dispatch({type: "setAlbumType", data: albumData.type})
    dispatch({type: "setAlbumTracklist", data: albumData.tracklist})
    dispatch({type: "setAlbumReleaseDate", data: new Date(albumData.releaseDate)})
    dispatch({type: "setAlbumImage", data: albumData.image})
    dispatch({type: "setAlbumPreview", data: albumData.image})
    dispatch({type: "setAlbumRating", data: albumData.rating})
    dispatch({type: "setAlbumTags", data: albumData.tags})
    dispatch({type: "setEditTitle", data: albumData.title})
    dispatch({type: "setEditType", data: albumData.type})
    dispatch({
      type: "setEditTracklist",
      data: albumData.tracklist?.map((track, index) => {
        return {name: track, id: index.toString()}
      })
    })
    dispatch({type: "setEditReleaseDate", data: new Date(albumData.releaseDate)})
    dispatch({type: "setEditImage", data: albumData.image})
    dispatch({type: "setEditPreview", data: albumData.image})
  }, [albumData])

  useEffect(() => {
    if (state.edit.submitCount) {
      async function editAlbumSubmit() {
        cancelPreviousRequest()

        dispatch({type: "startSubmitting"})

        try {
          const formData = new FormData()
          if (state.edit.title) {
            formData.append("title", state.edit.title)
          }
          if (state.edit.image) {
            formData.append("image", state.edit.image)
          }
          if (state.edit.releaseDate) {
            formData.append("releaseDate", state.edit.releaseDate)
          }
          if (state.edit.type) {
            formData.append("type", state.edit.type)
          }
          if (state.edit.tracklist) {
            const tracklistArray = state.edit.tracklist.map(track => {
              return track.name
            })
            formData.append("tracklist", JSON.stringify(tracklistArray))
          }

          const response = await Axios.post(`/edit/artist/${artist}/album/${album}`, formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

          if (response.data.success) {
            if (!response.data.changes) {
              appDispatch({type: "flashMessage", value: "No changes made.", warning: true})
              dispatch({type: "finishSubmitting"})
              dispatch({type: "finishEditing"})
            } else {
              if (!setEditHistoryState) {
                dispatch({type: "setAlbumTitle", data: response.data.album.title})
                dispatch({type: "setAlbumSlug", data: response.data.album.slug})
                dispatch({type: "setAlbumType", data: response.data.album.type})
                dispatch({type: "setAlbumTracklist", data: response.data.album.tracklist})
                dispatch({type: "setAlbumReleaseDate", data: new Date(response.data.album.releaseDate)})
                dispatch({type: "setAlbumImage", data: response.data.album.image})
                dispatch({type: "setAlbumPreview", data: response.data.album.image})
                dispatch({type: "setEditTitle", data: response.data.album.title})
                dispatch({type: "setEditType", data: response.data.album.type})
                dispatch({
                  type: "setEditTracklist",
                  data: state.albumData.tracklist.map((track, index) => {
                    return {name: track, id: index.toString()}
                  })
                })
                dispatch({type: "setEditReleaseDate", data: new Date(response.data.album.releaseDate)})
                dispatch({type: "setEditImage", data: response.data.album.image})
                dispatch({type: "setEditPreview", data: response.data.album.image})
              }

              appDispatch({type: "flashMessage", value: response.data.message})
              dispatch({type: "finishSubmitting"})
              dispatch({type: "finishEditing"})

              //Add item to edit history if data changed
              if (setEditHistoryState) {
                setEditHistoryState(draft => {
                  draft.editHistory.unshift({
                    _id: 0,
                    target: state.albumData._id,
                    user: {
                      username: appState.user.username,
                      slug: appState.user.slug
                    },
                    date: new Date(response.data.date),
                    initial: false,
                    deleted: false,
                    data: {
                      title: response.data.album.title,
                      image: response.data.album.image,
                      releaseDate: new Date(response.data.album.releaseDate),
                      type: response.data.album.type,
                      tracklist: response.data.album.tracklist
                    }
                  })
                  draft.albumData.title = response.data.album.title
                  draft.albumData.slug = response.data.album.slug
                  draft.albumData.image = response.data.album.image
                  draft.albumData.releaseDate = new Date(response.data.album.releaseDate)
                  draft.albumData.type = response.data.album.type
                  draft.albumData.tracklist = response.data.album.tracklist
                })
              }

              switch (state.page) {
                case "album":
                  history.push(`/music/${artist}/${response.data.album.slug}`)
                  return

                case "history":
                  history.push(`/history/${artist}/${response.data.album.slug}`)
                  return

                default:
                  history.push(`/music/${artist}/${response.data.album.slug}`)
                  return
              }
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
          dispatch({type: "finishSubmitting"})
          console.log(e)
        }
      }
      editAlbumSubmit()
    }
  }, [state.edit.submitCount])

  useEffect(() => {
    if (state.addReview.submitCount) {
      async function addReviewSubmit() {
        cancelPreviousRequest()

        dispatch({type: "addReviewStartSubmitting"})

        try {
          const response = await Axios.post(`/add-review/${artist}/${album}`, {summary: state.addReview.summary, review: state.addReview.review, tags: state.addReview.tags, rating: state.addReview.rating, token: appState.user.token}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            dispatch({type: "addReviewFinishSubmitting"})
            appDispatch({type: "flashMessage", value: response.data.message})
            history.push(`/music/${artist}/${album}/${response.data.review._id}`)
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          dispatch({type: "addReviewFinishSubmitting"})
          console.log(e)
        }
      }
      addReviewSubmit()
    }
  }, [state.addReview.submitCount])

  return (
    <AlbumProfileStateContext.Provider value={state}>
      <AlbumProfileDispatchContext.Provider value={dispatch}>
        <AlbumProfile />
        <CSSTransition timeout={250} in={state.edit.active} classNames="edit-album" unmountOnExit>
          <div className="edit-album">
            <Suspense fallback="">
              <EditAlbum />
            </Suspense>
          </div>
        </CSSTransition>
        <CSSTransition timeout={250} in={state.addReview.active} classNames="add-review" unmountOnExit>
          <div className="add-review">
            <Suspense fallback="">
              <AddReview />
            </Suspense>
          </div>
        </CSSTransition>
      </AlbumProfileDispatchContext.Provider>
    </AlbumProfileStateContext.Provider>
  )
}

export default withRouter(AlbumProfileContext)
