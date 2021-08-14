import React, {useEffect} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"

//Components
import Loading from "./Loading"
import Page from "./Page"
import AlbumTile from "./AlbumTile"

function TopRated() {
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    albums: [],
    moreAlbums: false,
    option: 365,
    loading: true,
    buttonLoading: false
  })

  useEffect(() => {
    async function getTopRated() {
      cancelPreviousRequest()
      try {
        setState(draft => {
          draft.loading = true
        })
        const response = await Axios.post(
          "/top-rated",
          {
            option: state.option,
            offset: 0
          },
          {cancelToken: newCancelToken()}
        )

        if (response.data.success) {
          //Format date
          response.data.albums.map(album => {
            album.releaseDate = new Date(album.releaseDate)
          })

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
    getTopRated()
  }, [state.option])

  async function loadMore() {
    cancelPreviousRequest()
    try {
      setState(draft => {
        draft.buttonLoading = true
      })
      const response = await Axios.post("/top-rated", {option: state.option, offset: state.albums.length}, {cancelToken: newCancelToken()})

      if (response.data.success) {
        setState(draft => {
          draft.albums = state.albums.concat(response.data.albums)
          draft.moreAlbums = response.data.moreAlbums
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
    <Page title="Top Rated">
      <div className="top-rated">
        <div className="top-rated__header">
          <h2 className="top-rated__title">Top Rated</h2>
          <select
            className="top-rated__select"
            defaultValue="365"
            onChange={e => {
              setState(draft => {
                draft.option = Number(e.target.value)
              })
            }}
          >
            <option value="365">1 year</option>
            <option value="3650">10 years</option>
            <option value="-1">All time</option>
          </select>
        </div>

        {state.loading && <Loading />}

        {!state.loading && (
          <div className="top-rated__body">
            {Boolean(state.albums.length) ? (
              state.albums.map(album => {
                return <AlbumTile album={album} key={album._id} />
              })
            ) : (
              <span>No albums found.</span>
            )}
          </div>
        )}

        {state.moreAlbums && (
          <button onClick={loadMore} className="top-rated__more" disabled={state.buttonLoading}>
            {state.buttonLoading ? <Loading fontSize="14" /> : "Load more"}
          </button>
        )}
      </div>
    </Page>
  )
}

export default TopRated
