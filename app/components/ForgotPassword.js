import React, {useEffect, useContext} from "react"
import {useImmer} from "use-immer"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faKey} from "@fortawesome/free-solid-svg-icons"

//Contexts
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function ForgotPassword() {
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    email: "",
    submitting: false,
    submitCount: 0
  })

  useEffect(() => {
    if (state.submitCount) {
      async function submitForgotPassword() {
        cancelPreviousRequest()
        setState(draft => {
          draft.submitting = true
        })

        try {
          const response = await Axios.post(`/reset-password`, {email: state.email}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            setState(draft => {
              draft.submitting = false
              draft.email = ""
            })
            appDispatch({type: "flashMessage", value: response.data.message})
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          setState(draft => {
            draft.submitting = false
          })
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          console.log(e)
        }
      }
      submitForgotPassword()
    }
  }, [state.submitCount])

  async function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  return (
    <Page title="Forgot Password">
      <form onSubmit={handleSubmit} className="form forgot-password">
        <h3 className="form__title">Reset Password</h3>

        <FormInput
          form="forgot-password"
          type="text"
          label="Email"
          name="email"
          value={state.email}
          onChange={e => {
            setState(draft => {
              draft.email = e.target.value
            })
          }}
        />

        <FormSubmit disabled={state.submitting}>
          Reset password
          <FontAwesomeIcon icon={faKey} />
        </FormSubmit>
      </form>
    </Page>
  )
}

export default ForgotPassword
