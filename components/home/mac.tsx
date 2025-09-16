'use client';

import { useTheme } from 'next-themes';
import styles from '../../styles/components/Banner.module.css';

function Mac() {
  const { theme } = useTheme();

  return (
    <div className="flex mt-3 items-center justify-center m-auto h-full">
      <svg
        width="842"
        height="512"
        viewBox="0 0 842 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.bannerMac}
      >
        <path
          d="M799 510C797.719 511.281 795.983 512 794.172 512H758.829C757.017 512 755.281 511.281 754 510H799Z"
          fill="#444444"
        />
        <path
          d="M799 510C797.719 511.281 795.983 512 794.172 512H758.829C757.017 512 755.281 511.281 754 510H799Z"
          fill="url(#paint0_linear_635_8)"
          fillOpacity="0.5"
        />
        <path
          d="M799 510C797.719 511.281 795.983 512 794.172 512H758.829C757.017 512 755.281 511.281 754 510H799Z"
          fill="url(#paint1_linear_635_8)"
          fillOpacity="0.8"
        />
        <path d="M751 506H802L799 510H754L751 506Z" fill="#C4C4C4" />
        <path
          d="M751 506H802L799 510H754L751 506Z"
          fill="url(#paint2_linear_635_8)"
          fillOpacity="0.8"
        />
        <path
          d="M88 510C86.719 511.281 84.983 512 83.172 512H47.8285C46.0175 512 44.2806 511.281 43 510H88Z"
          fill="#444444"
        />
        <path
          d="M88 510C86.719 511.281 84.983 512 83.172 512H47.8285C46.0175 512 44.2806 511.281 43 510H88Z"
          fill="url(#paint3_linear_635_8)"
          fillOpacity="0.5"
        />
        <path
          d="M88 510C86.719 511.281 84.983 512 83.172 512H47.8285C46.0175 512 44.2806 511.281 43 510H88Z"
          fill="url(#paint4_linear_635_8)"
          fillOpacity="0.8"
        />
        <path d="M40 506H91L88 510H43L40 506Z" fill="#C4C4C4" />
        <path
          d="M40 506H91L88 510H43L40 506Z"
          fill="url(#paint5_linear_635_8)"
          fillOpacity="0.8"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 478.712C0 478.319 0.309199 478 0.690599 478H841.309C841.691 478 842 478.319 842 478.712V492.247C842 497.014 839.5 501.5 836 504C833.543 505.253 830.371 506 827 506H15C11.6287 506 8.4568 505.253 6 504C2.5 501.5 0 497.014 0 492.247V478.712Z"
          fill="#777777"
        />
        <path
          d="M15 506H827C830.371 506 833.543 505.253 836 504H6C8.4568 505.253 11.6287 506 15 506Z"
          fill="url(#paint6_linear_635_8)"
          fillOpacity="0.4"
        />
        <path
          d="M0.690599 478C0.309199 478 0 478.319 0 478.712V492.247C0 497.014 2.5 501.5 6 504H836C839.5 501.5 842 497.014 842 492.247V478.712C842 478.319 841.691 478 841.309 478H0.690599Z"
          fill="url(#paint7_radial_635_8)"
          fillOpacity="0.6"
        />
        <path
          d="M0.690599 478C0.309199 478 0 478.319 0 478.712V492.247C0 497.014 2.5 501.5 6 504H836C839.5 501.5 842 497.014 842 492.247V478.712C842 478.319 841.691 478 841.309 478H0.690599Z"
          fill="url(#paint8_linear_635_8)"
          fillOpacity="0.5"
        />
        <path
          d="M76 20C76 8.95432 84.954 0 96 0H746C757.046 0 766 8.9543 766 20V478H76V20Z"
          fill="#0e0e0e"
        />
        <foreignObject
          x="76"
          y="20"
          width="690"
          height="458"
          style={{
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <video
            src={
              theme === 'dark'
                ? '/video-dark.mp4'
                : '/video-light.mp4'
            }
            autoPlay
            muted
            loop
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              padding: '0 15px 0 15px',
            }}
          ></video>
        </foreignObject>
        <path d="M766 463H76V478H766V463Z" fill="#1B1B1B" />
        <g style={{ mixBlendMode: 'hard-light' }} opacity="0.8">
          <path
            d="M356 478H485C485 483.833 479.444 486 475.074 486H365.926C361.556 486 356 483.833 356 478Z"
            fill="#E1E2E3"
          />
          <path
            d="M356 478H485C485 483.833 479.444 486 475.074 486H365.926C361.556 486 356 483.833 356 478Z"
            fill="url(#paint9_linear_635_8)"
          />
        </g>
        <g style={{ mixBlendMode: 'multiply' }}>
          <path
            d="M356 478H485C485 483.833 479.444 486 475.074 486H365.926C361.556 486 356 483.833 356 478Z"
            fill="#E1E2E3"
          />
          <path
            d="M356 478H485C485 483.833 479.444 486 475.074 486H365.926C361.556 486 356 483.833 356 478Z"
            fill="url(#paint10_linear_635_8)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_635_8"
            x1="776.5"
            y1="510"
            x2="776.5"
            y2="512"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.130273" />
            <stop offset="0.375191" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_635_8"
            x1="754"
            y1="512"
            x2="799"
            y2="512"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.035499" stopOpacity="0" />
            <stop offset="0.183503" />
            <stop offset="0.398916" stopOpacity="0" />
            <stop offset="0.633378" stopOpacity="0" />
            <stop offset="0.837067" />
            <stop offset="0.970418" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_635_8"
            x1="751"
            y1="510"
            x2="801"
            y2="510"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity="0" />
            <stop offset="0.186299" />
            <stop offset="0.456756" stopOpacity="0" />
            <stop offset="0.546908" stopOpacity="0" />
            <stop offset="0.835968" />
            <stop offset="1" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_635_8"
            x1="65.5"
            y1="510"
            x2="65.5"
            y2="512"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.130273" />
            <stop offset="0.375191" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_635_8"
            x1="43"
            y1="512"
            x2="88"
            y2="512"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.035499" stopOpacity="0" />
            <stop offset="0.183503" />
            <stop offset="0.398916" stopOpacity="0" />
            <stop offset="0.633378" stopOpacity="0" />
            <stop offset="0.837067" />
            <stop offset="0.970418" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_635_8"
            x1="40"
            y1="510"
            x2="90"
            y2="510"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity="0" />
            <stop offset="0.186299" />
            <stop offset="0.456756" stopOpacity="0" />
            <stop offset="0.546908" stopOpacity="0" />
            <stop offset="0.835968" />
            <stop offset="1" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_635_8"
            x1="786"
            y1="504"
            x2="786"
            y2="506"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.444236" stopOpacity="0" />
            <stop offset="0.867408" />
          </linearGradient>
          <radialGradient
            id="paint7_radial_635_8"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(421 504) rotate(180) scale(421 13633.9)"
          >
            <stop stopColor="white" stopOpacity="0.5" />
            <stop
              offset="0.364583"
              stopColor="white"
              stopOpacity="0"
            />
            <stop
              offset="0.703125"
              stopColor="white"
              stopOpacity="0"
            />
            <stop offset="0.96875" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id="paint8_linear_635_8"
            x1="789"
            y1="478"
            x2="789"
            y2="504"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.102925" stopOpacity="0" />
            <stop offset="0.6646" />
            <stop offset="0.772607" />
            <stop offset="0.90268" stopOpacity="0.58" />
            <stop offset="1" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint9_linear_635_8"
            x1="485"
            y1="486"
            x2="356"
            y2="486"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8A8A8A" />
            <stop
              offset="0.203125"
              stopColor="#AAAAAA"
              stopOpacity="0"
            />
            <stop
              offset="0.8125"
              stopColor="#AAAAAA"
              stopOpacity="0"
            />
            <stop offset="1" stopColor="#8A8A8A" />
          </linearGradient>
          <linearGradient
            id="paint10_linear_635_8"
            x1="485"
            y1="486"
            x2="356"
            y2="486"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8A8A8A" />
            <stop
              offset="0.203125"
              stopColor="#AAAAAA"
              stopOpacity="0"
            />
            <stop
              offset="0.8125"
              stopColor="#AAAAAA"
              stopOpacity="0"
            />
            <stop offset="1" stopColor="#8A8A8A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default Mac;
