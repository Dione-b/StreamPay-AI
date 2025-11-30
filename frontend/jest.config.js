module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom', './jest.setup.js'],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
    transformIgnorePatterns: [
      '/node_modules/(?!wagmi|viem|@tanstack|@testing-library|react-dom|react|@babel|@ethersproject|@radix-ui|lucide-react|@heroicons|@headlessui|@emotion|@mui|@reduxjs|@apollo|@auth0|@stripe|@solana|@walletconnect|@web3modal|@rainbow-me|@coinbase|@web3-react|@web3auth|@web3-onboard|@web3uikit|@web3-storage|@uniswap|@sentry|@chakra-ui|@nextui|@react-spring|@react-three|@react-dnd|@react-aria|@react-stately|@react-types|@react-hookz|@react-hook-form|@react-query|@react-table|@react-virtual|@react-icons|@react-google-maps|@react-pdf|@react-dropzone|@react-toastify|@react-hot-toast|@react-helmet|@react-i18next|@react-intl|@react-calendar|@react-date-picker|@react-time-picker|@react-color|@react-chartjs|@react-leaflet|@react-masonry-css|@react-slick|@react-spinners|@react-tooltip|@react-tippy|@react-use|@react-device-detect|@react-responsive|@react-window|@react-virtualized|@react-swipeable|@react-swipeable-views|@react-spring|@react-motion|@react-move|@react-flip-move|@react-transition-group|@react-router|@react-router-dom|@testing-library)/',
  ],
};
