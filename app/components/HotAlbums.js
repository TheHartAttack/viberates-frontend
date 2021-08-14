import React, {useEffect} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"

//Components
import Loading from "./Loading"
import Page from "./Page"
import AlbumTile from "./AlbumTile"

function HotAlbums() {
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    albums: [],
    moreAlbums: false,
    option: 90,
    loading: true,
    buttonLoading: false
  })

  useEffect(() => {
    async function getHotAlbums() {
      cancelPreviousRequest()
      try {
        setState(draft => {
          draft.loading = true
        })
        const response = await Axios.post(
          "/hot-albums",
          {
            option: state.option,
            offset: 0
          },
          {cancelToken: newCancelToken()}
        )

        if (response.data.success) {
          setState(draft => {
            draft.albums = response.data.albums
            draft.total = response.data.total
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
    getHotAlbums()
  }, [state.option])

  async function loadMore() {
    try {
      setState(draft => {
        draft.buttonLoading = true
      })
      const alreadyLoaded = state.albums.map(album => {
        return album._id
      })
      const response = await Axios.post("/hot-albums", {
        option: state.option,
        offset: state.albums.length
      })

      if (response.data.success) {
        setState(draft => {
          draft.albums = state.albums.concat(response.data.albums)
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
    <Page title="Hot Albums">
      <div className="hot-albums">
        <div className="hot-albums__header">
          <h2 className="hot-albums__title">Hot Albums</h2>
          <select
            className="hot-albums__select"
            defaultValue="90"
            onChange={e => {
              setState(draft => {
                draft.option = Number(e.target.value)
              })
            }}
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="180">180 days</option>
            <option value="365">365 days</option>
          </select>
        </div>

        {state.loading && <Loading />}

        {!state.loading && (
          <div className="hot-albums__body">
            {Boolean(state.albums.length) ? (
              state.albums.map(album => {
                return <AlbumTile album={album} key={album._id} />
              })
            ) : (
              <span>No albums found.</span>
            )}
          </div>
        )}

        {state.albums.length < state.total && (
          <button onClick={loadMore} className="hot-albums__more" disabled={state.buttonLoading}>
            {state.buttonLoading ? <Loading fontSize="14" /> : "Load more"}
          </button>
        )}
      </div>
    </Page>
  )
}

export default HotAlbums
