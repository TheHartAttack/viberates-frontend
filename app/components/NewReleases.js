import React, {useEffect} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"

//Components
import Loading from "./Loading"
import Page from "./Page"
import AlbumTile from "./AlbumTile"

function NewReleases() {
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    albums: [],
    moreAlbums: false,
    loading: true,
    buttonLoading: false
  })

  useEffect(() => {
    async function getNewReleases() {
      cancelPreviousRequest()
      try {
        setState(draft => {
          draft.loading = true
        })
        const response = await Axios.post(
          "/new-releases",
          {
            offset: 0
          },
          {cancelToken: newCancelToken()}
        )

        if (response.data.success) {
          setState(draft => {
            draft.albums = response.data.albums
            draft.moreAlbums = response.data.moreAlbums
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
    getNewReleases()
  }, [])

  async function loadMore() {
    try {
      setState(draft => {
        draft.buttonLoading = true
      })
      const response = await Axios.post("/new-releases", {
        offset: state.albums.length
      })

      if (response.data.success) {
        setState(draft => {
          draft.albums = state.albums.concat(response.data.albums)
          draft.moreAlbums = response.data.moreAlbums
          draft.buttonLoading = false
        })
      } else {
        console.log(e)
        setState(draft => {
          draft.buttonLoading = false
        })
      }
    } catch (e) {
      console.log(e)
      setState(draft => {
        draft.buttonLoading = false
      })
    }
  }

  return (
    <Page title="New Releases">
      <div className="new-releases">
        <div className="new-releases__header">
          <h2 className="new-releases__title">New Releases</h2>
        </div>

        {state.loading && <Loading />}

        {!state.loading && (
          <div className="new-releases__body">
            {state.albums.map(album => {
              return <AlbumTile album={album} key={album._id} />
            })}
          </div>
        )}

        {state.moreAlbums && (
          <button onClick={loadMore} className="new-releases__more" disabled={state.buttonLoading}>
            {state.buttonLoading ? <Loading fontSize="14" /> : "Load more"}
          </button>
        )}
      </div>
    </Page>
  )
}

export default NewReleases
