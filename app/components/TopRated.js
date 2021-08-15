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
    years: [new Date().getFullYear()],
    decades: [Math.floor(new Date().getFullYear() / 10) * 10],
    type: "year",
    yearOption: new Date().getFullYear(),
    decadeOption: Math.floor(new Date().getFullYear() / 10) * 10,
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
            type: state.type,
            yearOption: state.yearOption,
            decadeOption: state.decadeOption,
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
            draft.years = response.data.years
            draft.decades = response.data.decades
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
  }, [state.type, state.yearOption, state.decadeOption])

  async function loadMore() {
    cancelPreviousRequest()
    try {
      setState(draft => {
        draft.buttonLoading = true
      })
      const response = await Axios.post(
        "/top-rated",
        {
          type: state.type,
          yearOption: state.yearOption,
          decadeOption: state.decadeOption,
          offset: state.albums.length
        },
        {cancelToken: newCancelToken()}
      )

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
            defaultValue="year"
            onChange={e => {
              setState(draft => {
                draft.type = e.target.value
              })
            }}
          >
            <option value="year">Year</option>
            <option value="decade">Decade</option>
            <option value="all">All Time</option>
          </select>

          {state.type == "year" && (
            <select
              className="top-rated__year"
              value={state.yearOption}
              onChange={e => {
                setState(draft => {
                  draft.yearOption = e.target.value
                })
              }}
            >
              {state.years.map((year, index) => {
                return (
                  <option key={index} value={year}>
                    {year}
                  </option>
                )
              })}
            </select>
          )}

          {state.type == "decade" && (
            <select
              className="top-rated__decade"
              value={state.decadeOption}
              onChange={e => {
                setState(draft => {
                  draft.decadeOption = e.target.value
                })
              }}
            >
              {state.decades.map((decade, index) => {
                return (
                  <option key={index} value={decade}>
                    {decade}s
                  </option>
                )
              })}
            </select>
          )}
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
