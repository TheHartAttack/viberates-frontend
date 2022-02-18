import React, {useEffect, useContext} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {withRouter, Redirect, useParams, Link} from "react-router-dom"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes, faSave, faTrash} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import ArtistProfile from "./ArtistProfile"
import FormInput from "./form/FormInput"
import ImageInput from "./form/ImageInput"
import FormSubmit from "./form/FormSubmit"

function EditAlbum(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {artist, album} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    artistData: {},
    id: "",
    title: "",
    image: "",
    preview: "",
    releaseDate: new Date(),
    type: "Studio",
    submitting: false,
    submitCount: 0,
    deleting: false,
    deleteCount: 0,
    loading: true
  })

  useEffect(() => {
    async function getAlbum() {
      cancelPreviousRequest()

      try {
        const response = await Axios.get(`/artist/${artist}/album/${album}`, {cancelToken: newCancelToken()})

        if (response.data.success) {
          setState(draft => {
            draft.artistData = response.data.album.artist
            draft.id = response.data.album._id
            draft.title = response.data.album.title
            draft.releaseDate = new Date(response.data.album.releaseDate)
            draft.type = response.data.album.type
            draft.image = response.data.album.image
            draft.preview = response.data.album.image
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

  useEffect(() => {
    if (state.submitCount) {
      async function editAlbum() {
        cancelPreviousRequest()

        setState(draft => {
          draft.submitting = true
        })

        try {
          const formData = new FormData()
          if (state.title) {
            formData.append("title", state.title)
          }
          if (state.image) {
            formData.append("image", state.image)
          }
          if (state.releaseDate) {
            formData.append("releaseDate", state.releaseDate)
          }
          if (state.type) {
            formData.append("type", state.type)
          }

          const response = await Axios.post(`/edit/artist/${artist}/album/${album}`, formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

          if (response.data.success) {
            appDispatch({type: "flashMessage", value: response.data.message})
            setState(draft => {
              draft.submitting = false
            })
            props.history.push(`/music/${artist}/${response.data.album.slug}`)
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
      editAlbum()
    }
  }, [state.submitCount])

  useEffect(() => {
    if (state.deleteCount) {
      async function deleteAlbum() {
        cancelPreviousRequest()

        setState(draft => {
          draft.deleting = true
        })

        try {
          const response = await Axios.post(`/deleteAlbum`, {albumId: state.id, albumTitle: state.title}, {cancelToken: newCancelToken(), headers: {authorization: appState.user.token}})

          if (response.data.success) {
            appDispatch({type: "flashMessage", value: response.data.message})
            setState(draft => {
              draft.deleting = false
            })
            props.history.push(`/music/${artist}`)
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
            draft.deleting = false
          })
          console.log(e)
        }
      }
      deleteAlbum()
    }
  }, [state.deleteCount])

  function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  function handleDelete(e) {
    e.preventDefault()
    setState(draft => {
      draft.deleteCount++
    })
  }

  if (!appState.user.token || appState.user.suspended) {
    return <Redirect to={`/music/${artist}/${album}`} />
  }

  if (state.loading) {
    return (
      <Page title="Edit Artist">
        <Loading />
      </Page>
    )
  }

  return (
    <Page title="Edit Album">
      <ArtistProfile artistData={state.artistData} artist={artist} page="edit-album" />

      <form onSubmit={handleSubmit} className="form add-edit-album" encType="multipart/form-data">
        <FormInput
          form="album"
          type="text"
          label="Name"
          name="name"
          value={state.title}
          onChange={e => {
            setState(draft => {
              draft.title = e.target.value
            })
          }}
        />

        <FormInput
          form="album"
          type="date"
          label="Release Date"
          name="releaseDate"
          releaseDate={state.releaseDate}
          onChange={date => {
            setState(draft => {
              draft.releaseDate = date
            })
          }}
        />

        <FormInput
          form="album"
          type="select"
          label="Type"
          name="type"
          className="narrow"
          value={state.type}
          options={["Studio", "EP", "Live", "Compilation"]}
          onChange={e => {
            setState(draft => {
              draft.type = e.target.value
            })
          }}
        />

        <ImageInput form="artist" label="Image" name="image" image={state.image} preview={state.preview} setState={setState} />

        <div className="form__buttons">
          <Link to={`/music/${artist}/${album}`} className="button button--cancel">
            Cancel <FontAwesomeIcon icon={faTimes} />
          </Link>

          <FormSubmit disabled={state.submitting}>
            Save changes <FontAwesomeIcon icon={faSave} />
          </FormSubmit>
        </div>

        {(appState.user.type.includes("admin") || appState.user.type.includes("mod")) && (
          <div className="form__buttons">
            <button onClick={handleDelete} type="button" className="button" disabled={state.deleting}>
              Delete album <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </form>
    </Page>
  )
}

export default withRouter(EditAlbum)
