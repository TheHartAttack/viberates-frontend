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
import ImageInput from "./form/ImageInput"
import FormSubmit from "./form/FormSubmit"
import ArtistProfile from "./ArtistProfile"

function AddAlbum(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {artist} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    artistData: {},
    title: "",
    image: "",
    preview: "",
    releaseDate: new Date(),
    type: "Studio",
    submitting: false,
    submitCount: 0,
    loading: true
  })

  if (!appState.user.token || appState.user.suspended) {
    return <Redirect to={`/music/${artist}`} />
  }

  useEffect(() => {
    async function getArtist() {
      cancelPreviousRequest()

      try {
        const response = await Axios.get(`/artist/${artist}`, {cancelToken: newCancelToken()})

        if (response.data.success) {
          setState(draft => {
            draft.artistData = response.data.artist
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
    getArtist()
  }, [])

  useEffect(() => {
    if (state.submitCount) {
      async function submitAlbum() {
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

          const response = await Axios.post(`/add-album/${artist}`, formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

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
      submitAlbum()
      return () => ourRequest.cancel()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  return (
    <Page title={`Add new album`}>
      <ArtistProfile artistData={state.artistData} artist={artist} page="add-album" />

      <form onSubmit={handleSubmit} className="form add-edit-album" encType="multipart/form-data">
        <FormInput
          form="album"
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

        <ImageInput form="album" label="Image" name="image" image={state.image} preview={state.preview} setState={setState} />

        <div className="form__buttons">
          <Link to={`/music/${artist}`} className="button button--cancel">
            Cancel <FontAwesomeIcon icon={faTimes} />
          </Link>

          <FormSubmit disabled={state.submitting}>
            Add album to database
            <FontAwesomeIcon icon={faArrowRight} />
          </FormSubmit>
        </div>
      </form>
    </Page>
  )
}

export default withRouter(AddAlbum)
