import React from 'react';
import { Link } from 'react-router-dom';
import { getSectionImage } from '../../../utils/sectionImage';
import styles from '../../../styles/themes/customer.module.css';

const TOUR_DATES = [
  { id: 1, date: 'Apr 12, 2026', city: 'Los Angeles, CA', venue: 'The Roxy Theatre', soldOut: false },
  { id: 2, date: 'Apr 18, 2026', city: 'San Francisco, CA', venue: 'The Fillmore', soldOut: false },
  { id: 3, date: 'Apr 25, 2026', city: 'Portland, OR', venue: 'Crystal Ballroom', soldOut: false },
  { id: 4, date: 'May 2, 2026', city: 'Seattle, WA', venue: 'Neumos', soldOut: true },
  { id: 5, date: 'May 9, 2026', city: 'Denver, CO', venue: 'Ogden Theatre', soldOut: false },
  { id: 6, date: 'May 17, 2026', city: 'Chicago, IL', venue: 'Metro Chicago', soldOut: false },
  { id: 7, date: 'May 24, 2026', city: 'New York, NY', venue: 'Irving Plaza', soldOut: false },
  { id: 8, date: 'May 31, 2026', city: 'Boston, MA', venue: 'Paradise Rock Club', soldOut: false },
];

const ALBUM_TRACKS = [
  { num: 1, title: 'Absolutely Whelmed', duration: '3:41' },
  { num: 2, title: 'Corporate Bedtime Story', duration: '2:58' },
  { num: 3, title: 'Everything Is Fine (It\'s Not)', duration: '4:12' },
  { num: 4, title: 'Seven Coffees Deep', duration: '3:27' },
  { num: 5, title: 'Reply All Apocalypse', duration: '3:54' },
  { num: 6, title: 'The Burnout Anthem', duration: '5:03' },
];

const TicketIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M2 9a1 1 0 0 1 1-1h1a2 2 0 0 0 0-4H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1a2 2 0 0 0 0 4h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z" />
  </svg>
);

const PlayIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const SpotifyIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <circle cx="12" cy="12" r="12" />
    <path
      fill="#1DB954"
      d="M17.9 10.9c-2.9-1.7-7.7-1.9-10.5-1.1-.4.1-.9-.1-1-.6s.1-.9.6-1c3.2-.9 8.5-.7 11.8 1.3.4.2.5.8.3 1.1-.3.4-.8.5-1.2.3zm-.1 2.8c-.3.4-.8.5-1.2.2-2.4-1.5-6.1-1.9-9-1-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.3-1 7.4-.5 10.2 1.2.4.2.5.7.2 1.1h.3zm-1.3 2.7c-.2.3-.7.4-1 .1-2.1-1.3-4.7-1.6-7.8-.9-.3.1-.7-.1-.8-.5-.1-.3.1-.7.5-.8 3.4-.8 6.3-.4 8.7 1.1.3.2.4.7.1 1h.3z"
    />
  </svg>
);

const AppleMusicIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.454.026C4.875.146 4.22.29 3.611.5a4.784 4.784 0 0 0-2.09 1.636 4.894 4.894 0 0 0-.93 2.085 11.26 11.26 0 0 0-.16 1.585C.407 5.985.4 6.166.4 6.348v11.302c.01.15.02.3.034.45.104 1.15.46 2.16 1.18 3.01.878 1.04 2.01 1.63 3.37 1.83.22.03.445.05.665.06H18.35c.225 0 .45-.03.673-.06 1.17-.18 2.196-.68 3.016-1.52.66-.69 1.087-1.52 1.285-2.44.12-.56.175-1.13.18-1.7.002-.047.004-.094.004-.142V6.348a3.15 3.15 0 0 0-.014-.224zM16.274 8.32v7.84a2.18 2.18 0 0 1-1.1 1.9 2.44 2.44 0 0 1-2.344.128 2.184 2.184 0 0 1-1.287-2.017c0-1.22.978-2.208 2.186-2.208.28 0 .552.05.81.148V7.16L9.76 8.31v6.96a2.18 2.18 0 0 1-1.1 1.9 2.44 2.44 0 0 1-2.344.128A2.184 2.184 0 0 1 5.03 15.28c0-1.22.978-2.208 2.187-2.208.28 0 .552.05.81.148V6.296c0-.386.254-.727.624-.836l7.23-2.074c.48-.138.975.22.975.718l-.582 4.216z" />
  </svg>
);

const TourAlbum = () => {
  const albumArt = getSectionImage('WHELMED ALBUM ART', 600, 600);

  return (
    <section
      id="tour-album"
      className={styles.tourAlbumSection}
      aria-labelledby="tour-album-heading"
    >
      <div className={styles.tourAlbumInner}>
        <header className={styles.tourAlbumHeader}>
          <p className={styles.tourAlbumOverline}>New Album + 2026 World Tour</p>
          <h2 id="tour-album-heading" className={styles.tourAlbumHeading}>
            We&rsquo;re Back.<br />
            <span className={styles.tourAlbumHeadingHighlight}>And This Time We Mean It.</span>
          </h2>
        </header>

        <div className={styles.tourAlbumGrid}>
          {/* Album player card */}
          <article className={styles.albumCard} aria-label="Whelmed — new album by Chaotic the Harmony">
            <div className={styles.albumArtWrapper}>
              <img
                src={albumArt}
                alt="Whelmed album cover — abstract dark artwork with yellow text"
                className={styles.albumArtImg}
                width="280"
                height="280"
              />
              <div className={styles.albumPlayOverlay} aria-hidden="true">
                <div className={styles.albumPlayButton}>
                  <PlayIcon />
                </div>
              </div>
            </div>

            <div className={styles.albumMeta}>
              <p className={styles.albumBadge}>Out Now</p>
              <h3 className={styles.albumTitle}>Whelmed</h3>
              <p className={styles.albumArtistName}>Chaotic the Harmony</p>
              <p className={styles.albumYear}>2026 &bull; 6 Tracks &bull; 23 min</p>
            </div>

            <ol className={styles.albumTracklist} aria-label="Track listing for Whelmed">
              {ALBUM_TRACKS.map((track) => (
                <li key={track.num} className={styles.albumTrack}>
                  <span className={styles.albumTrackNum} aria-hidden="true">{track.num}</span>
                  <span className={styles.albumTrackName}>{track.title}</span>
                  <span className={styles.albumTrackDuration}>
                    <span className="srOnly">Duration: </span>
                    {track.duration}
                  </span>
                </li>
              ))}
            </ol>

            <div className={styles.albumStreamLinks}>
              <p className={styles.albumStreamLabel}>Stream on:</p>
              <div className={styles.albumStreamButtons}>
                <a
                  href="#spotify"
                  className={styles.albumStreamBtn}
                  aria-label="Stream Whelmed on Spotify"
                >
                  <SpotifyIcon />
                  Spotify
                </a>
                <a
                  href="#apple-music"
                  className={styles.albumStreamBtn}
                  aria-label="Stream Whelmed on Apple Music"
                >
                  <AppleMusicIcon />
                  Apple Music
                </a>
              </div>
            </div>
          </article>

          {/* Tour dates card */}
          <article className={styles.tourCard} aria-label="2026 World Tour dates">
            <header className={styles.tourCardHeader}>
              <div className={styles.tourCardIcon} aria-hidden="true">
                <TicketIcon />
              </div>
              <div>
                <h3 className={styles.tourCardTitle}>2026 World Tour</h3>
                <p className={styles.tourCardSubtitle}>
                  We promise the van won&rsquo;t break down this time. Probably.
                </p>
              </div>
            </header>

            <ol className={styles.tourDateList} aria-label="Upcoming tour dates">
              {TOUR_DATES.map((show) => (
                <li key={show.id} className={styles.tourDateItem}>
                  <div className={styles.tourDateMeta}>
                    <time className={styles.tourDateDate} dateTime={show.date}>
                      {show.date}
                    </time>
                    <strong className={styles.tourDateCity}>{show.city}</strong>
                    <span className={styles.tourDateVenue}>{show.venue}</span>
                  </div>
                  {show.soldOut ? (
                    <span className={styles.tourDateSoldOut} aria-label={`${show.city} — sold out`}>
                      Sold Out
                    </span>
                  ) : (
                    <a
                      href="#tickets"
                      className={styles.tourDateTicketBtn}
                      aria-label={`Get tickets for ${show.city} on ${show.date} at ${show.venue}`}
                    >
                      Tickets
                    </a>
                  )}
                </li>
              ))}
            </ol>

            <div className={styles.tourCardFooter}>
              <Link to="/tour" className={styles.tourViewAll}>
                View all tour dates
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default TourAlbum;
