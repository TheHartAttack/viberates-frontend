import React, {useEffect, useContext} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {withRouter, Redirect, useParams, Link} from "react-router-dom"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes, faSave} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import FormInput from "./form/FormInput"
import ImageInput from "./form/ImageInput"
import FormSubmit from "./form/FormSubmit"

function EditArtist(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {artist} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    artistData: {},
    name: "",
    image: "",
    preview: "",
    submitting: false,
    submitCount: 0,
    loading: true
  })

  useEffect(() => {
    async function getArtist() {
      cancelPreviousRequest()
      try {
        const response = await Axios.get(`/artist/${artist}`, {cancelToken: newCancelToken()})

        if (response.data.success) {
          setState(draft => {
            draft.artistData = response.data.artist
            draft.name = response.data.artist.name
            draft.image = response.data.artist.image
            draft.preview = response.data.artist.image
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
      async function editArtist() {
        cancelPreviousRequest()

        setState(draft => {
          draft.submitting = true
        })

        try {
          const formData = new FormData()
          formData.append("name", state.name)
          formData.append("image", state.image)
          const response = await Axios.post(`/edit/artist/${artist}`, formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

          if (response.data.success) {
            appDispatch({type: "flashMessage", value: response.data.message})
            setState(draft => {
              draft.submitting = false
            })
            props.history.push(`/music/${response.data.artist.slug}`)
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          setState(draft => {
            draft.submitting = false
          })
          console.log(e)
        }
      }
      editArtist()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  if (!appState.user.token || appState.user.suspended) {
    return <Redirect to={`/music/${artist}`} />
  }

  if (state.loading) {
    return (
      <Page title="Edit Artist">
        <Loading />
      </Page>
    )
  }

  return (
    <Page title="Edit Artist">
      <form onSubmit={handleSubmit} className="form add-edit-artist" encType="multipart/form-data">
        <h3 className="form__title">Edit {state.artistData.name}</h3>

        <FormInput
          form="artist"
          type="text"
          label="Name"
          name="name"
          value={state.name}
          onChange={e => {
            setState(draft => {
              draft.name = e.target.value
            })
          }}
        />

        <ImageInput form="artist" label="Image" name="image" image={state.image} preview={state.preview} setState={setState} />

        <div className="form__buttons">
          <Link to={`/music/${artist}`} className="button button--cancel">
            Cancel <FontAwesomeIcon icon={faTimes} />
          </Link>

          <FormSubmit disabled={state.submitting}>
            Save changes <FontAwesomeIcon icon={faSave} />
          </FormSubmit>
        </div>
      </form>
    </Page>
  )
}

export default withRouter(EditArtist)
