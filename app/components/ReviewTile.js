import React, {useEffect} from "react"
import {Link} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowRight} from "@fortawesome/free-solid-svg-icons"

function ReviewTile(props) {
  return (
    <div className="review-tile">
      <img className="review-tile__image" src={props.review.album.image} />
      <div className="review-tile__info">
        <Link to={`/music/${props.review.album.artist.slug}/${props.review.album.slug}`} className="review-tile__title">
          {props.review.album.title}
        </Link>
        <Link to={`/music/${props.review.album.artist.slug}`} className="review-tile__artist">
          {props.review.album.artist.name}
        </Link>
      </div>
      <span className="review-tile__rating">{props.review.rating}</span>

      <div className="review-tile__body">{props.review.summary}</div>

      <div className="review-tile__posted">
        <span>
          Posted{" "}
          {props.page != "user" && (
            <>
              by{" "}
              <Link to={`/user/${props.review.author.slug}`} className="review-tile__author">
                {props.review.author.username}
              </Link>{" "}
            </>
          )}
          on{" "}
          <span className="review-tile__date">
            {props.review.date.getDate()}/{props.review.date.getMonth() + 1}/{props.review.date.getFullYear()}
          </span>
        </span>
      </div>
      <Link to={`/music/${props.review.album.artist.slug}/${props.review.album.slug}/${props.review._id}`} className="review-tile__link">
        <FontAwesomeIcon icon={faArrowRight} />
      </Link>
    </div>
  )
}

export default ReviewTile
