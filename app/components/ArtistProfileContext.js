import React, {Suspense, useEffect, useContext} from "react"
import {withRouter, useParams} from "react-router-dom"
import {useImmerReducer} from "use-immer"
import Axios from "axios"
import {CSSTransition} from "react-transition-group"
import useCancelToken from "react-use-cancel-token"

//Contexts & Reducers
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import ArtistProfileStateContext from "../contexts/ArtistProfileStateContext"
import ArtistProfileDispatchContext from "../contexts/ArtistProfileDispatchContext"
import ArtistProfileReducer from "../reducers/ArtistProfileReducer"

//Components
import ArtistProfile from "./ArtistProfile"
import EditArtist from "./EditArtist"

function ArtistProfileContext({history, artistData, page, setEditHistoryState}) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {artist} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const initialState = {
    artistData,
    page,
    loading: true,
    userHasReviewed: false,
    edit: {
      active: false,
      name: artistData.name,
      image: artistData.image,
      preview: artistData.image,
      submitting: false,
      submitCount: 0,
      deleting: false,
      deleteCount: 0
    }
  }

  const [state, dispatch] = useImmerReducer(ArtistProfileReducer, initialState)

  useEffect(() => {
    if (state.edit.active) {
      document.querySelector("body").classList.add("noscroll")
    } else {
      document.querySelector("body").classList.remove("noscroll")
    }
  }, [state.edit.active])

  useEffect(() => {
    dispatch({type: "setArtistName", data: artistData.name})
    dispatch({type: "setArtistSlug", data: artistData.slug})
    dispatch({type: "setArtistImage", data: artistData.image})
    dispatch({type: "setArtistPreview", data: artistData.image})
    dispatch({type: "setEditName", data: artistData.name})
    dispatch({type: "setEditImage", data: artistData.image})
    dispatch({type: "setEditPreview", data: artistData.image})
  }, [artistData])

  useEffect(() => {
    if (state.edit.submitCount) {
      async function editArtistSubmit() {
        cancelPreviousRequest()

        dispatch({type: "startSubmitting"})

        try {
          const formData = new FormData()
          if (state.edit.name) {
            formData.append("name", state.edit.name)
          }
          if (state.edit.image) {
            formData.append("image", state.edit.image)
          }

          const response = await Axios.post(`/edit/artist/${artist}`, formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})
          console.log(response.data)
          if (response.data.success) {
            if (!response.data.changes) {
              appDispatch({type: "flashMessage", value: "No changes made.", warning: true})
              dispatch({type: "finishSubmitting"})
              dispatch({type: "finishEditing"})
            } else {
              if (!setEditHistoryState) {
                dispatch({type: "setArtistName", data: response.data.artist.name})
                dispatch({type: "setArtistSlug", data: response.data.artist.slug})
                dispatch({type: "setArtistImage", data: response.data.artist.image})
                dispatch({type: "setArtistPreview", data: response.data.artist.image})
                dispatch({type: "setEditName", data: response.data.artist.name})
                dispatch({type: "setEditImage", data: response.data.artist.image})
                dispatch({type: "setEditPreview", data: response.data.artist.image})
              }
            }
            appDispatch({type: "flashMessage", value: response.data.message})
            dispatch({type: "finishSubmitting"})
            dispatch({type: "finishEditing"})

            //Add item to edit history if data changed
            if (setEditHistoryState) {
              setEditHistoryState(draft => {
                draft.editHistory.unshift({
                  _id: 0,
                  target: state.artistData._id,
                  user: {
                    username: appState.user.username,
                    slug: appState.user.slug
                  },
                  date: new Date(response.data.date),
                  initial: false,
                  deleted: false,
                  data: {
                    name: response.data.artist.name,
                    image: response.data.artist.image
                  }
                })
                draft.artistData.name = response.data.artist.name
                draft.artistData.slug = response.data.artist.slug
                draft.artistData.image = response.data.artist.image
              })
            }

            switch (state.page) {
              case "artist":
                history.push(`/music/${response.data.artist.slug}`)
                return

              case "history":
                history.push(`/history/${response.data.artist.slug}`)
                return

              default:
                history.push(`/music/${response.data.artist.slug}`)
                return
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
      editArtistSubmit()
    }
  }, [state.edit.submitCount])

  return (
    <ArtistProfileStateContext.Provider value={state}>
      <ArtistProfileDispatchContext.Provider value={dispatch}>
        <ArtistProfile setEditHistoryState={setEditHistoryState} />
        <CSSTransition timeout={250} in={state.edit.active} classNames="edit-artist" unmountOnExit>
          <div className="edit-artist">
            <Suspense fallback="">
              <EditArtist />
            </Suspense>
          </div>
        </CSSTransition>
      </ArtistProfileDispatchContext.Provider>
    </ArtistProfileStateContext.Provider>
  )
}

export default withRouter(ArtistProfileContext)
