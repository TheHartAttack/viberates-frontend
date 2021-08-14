import React, {useEffect, useContext} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {withRouter, Redirect, Link} from "react-router-dom"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes, faArrowRight} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import FormInput from "./form/FormInput"
import ImageInput from "./form/ImageInput"
import FormSubmit from "./form/FormSubmit"

function AddArtist(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    name: "",
    image: "",
    preview: "",
    submitting: false,
    submitCount: 0
  })

  useEffect(() => {
    if (state.submitCount) {
      async function submitArtist() {
        cancelPreviousRequest()

        setState(draft => {
          draft.submitting = true
        })

        try {
          const formData = new FormData()
          formData.append("name", state.name)
          formData.append("image", state.image)
          const response = await Axios.post("/add-artist", formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

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
      submitArtist()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  if (!appState.user.token || appState.user.suspended) {
    return <Redirect to={`/`} />
  }

  return (
    <Page title="Add Artist">
      <form onSubmit={handleSubmit} className="form add-edit-artist" encType="multipart/form-data">
        <FormInput
          form="artist"
          type="text"
          label="Name"
          name="name"
          onChange={e => {
            setState(draft => {
              draft.name = e.target.value
            })
          }}
        />
        <ImageInput form="artist" label="Image" name="image" image={state.image} preview={state.preview} setState={setState} />

        <div className="form__buttons">
          <Link to={`/`} className="button button--cancel">
            Cancel <FontAwesomeIcon icon={faTimes} />
          </Link>

          <FormSubmit disabled={state.submitting}>
            Add artist to database
            <FontAwesomeIcon icon={faArrowRight} />
          </FormSubmit>
        </div>
      </form>
    </Page>
  )
}

export default withRouter(AddArtist)
