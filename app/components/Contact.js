import React, {useEffect, useContext} from "react"
import {useImmer} from "use-immer"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faEnvelope} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function Contact() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    username: appState.user.username,
    email: appState.user.email,
    content: "",
    submitting: false,
    submitCount: 0
  })

  useEffect(() => {
    setState(draft => {
      draft.username = appState.user.username
      draft.email = appState.user.email
    })
  }, [appState.user.token])

  useEffect(() => {
    if (state.submitCount) {
      async function submitMessage() {
        cancelPreviousRequest()

        try {
          setState(draft => {
            draft.submitting = true
          })

          const response = await Axios.post("/contact", {username: state.username, email: state.email, content: state.content}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            setState(draft => {
              draft.submitting = false
              draft.content = ""
            })
            appDispatch({type: "flashMessage", value: response.data.message})
          } else {
            console.log(response.data.message)
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
      submitMessage()
    }
  }, [state.submitCount])

  async function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  return (
    <Page title="Contact">
      <form onSubmit={handleSubmit} className="form contact">
        <h3 className="form__title">Contact admin</h3>

        {!appState.user.token && (
          <>
            <FormInput
              form="contact"
              type="text"
              label="Name"
              name="name"
              onChange={e => {
                setState(draft => {
                  draft.username = e.target.value
                })
              }}
            />

            <FormInput
              form="contact"
              type="text"
              label="Email"
              name="email"
              onChange={e => {
                setState(draft => {
                  draft.email = e.target.value
                })
              }}
            />
          </>
        )}

        <FormInput
          form="contact"
          type="textarea"
          label="Message"
          name="message"
          value={state.content}
          onChange={e => {
            setState(draft => {
              draft.content = e.target.value
            })
          }}
        />

        <FormSubmit disabled={state.submitting}>
          Send message
          <FontAwesomeIcon icon={faEnvelope} />
        </FormSubmit>
      </form>
    </Page>
  )
}

export default Contact
