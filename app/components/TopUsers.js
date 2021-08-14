import React, {useEffect} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"

//Components
import Loading from "./Loading"
import Page from "./Page"
import UserTile from "./UserTile"

function TopUsers() {
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    users: [],
    moreUsers: false,
    loading: true,
    buttonLoading: false
  })

  useEffect(() => {
    async function getTopUsers() {
      cancelPreviousRequest()
      try {
        setState(draft => {
          draft.loading = true
        })
        const response = await Axios.post(
          "/top-users",
          {
            offset: 0
          },
          {cancelToken: newCancelToken()}
        )

        if (response.data.success) {
          setState(draft => {
            draft.users = response.data.users
            draft.moreUsers = response.data.moreUsers
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
        console.log(e)
        setState(draft => {
          draft.loading = false
        })
      }
    }
    getTopUsers()
  }, [])

  async function loadMore() {
    cancelPreviousRequest()
    try {
      setState(draft => {
        draft.buttonLoading = true
      })
      const response = await Axios.post("/top-users", {offset: state.users.length}, {cancelToken: newCancelToken()})

      if (response.data.success) {
        setState(draft => {
          draft.users = state.users.concat(response.data.users)
          draft.moreUsers = response.data.moreUsers
          draft.buttonLoading = false
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
        draft.buttonLoading = false
      })
    }
  }

  return (
    <Page title="Top Users">
      <div className="top-users">
        <div className="top-users__header">
          <h2 className="top-users__title">Top Users</h2>
        </div>

        {state.loading && <Loading />}

        {!state.loading && (
          <div className="top-users__body top-users__body--6-col">
            {state.users.map(user => {
              return <UserTile user={user} key={user._id} />
            })}
          </div>
        )}

        {state.moreUsers && (
          <button onClick={loadMore} className="top-users__more" disabled={state.buttonLoading}>
            {state.buttonLoading ? <Loading fontSize="14" /> : "Load more"}
          </button>
        )}
      </div>
    </Page>
  )
}

export default TopUsers
