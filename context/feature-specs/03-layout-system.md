We need to create te layout of the whole page.tsx file to accomodate the navbars, sidaebars.

### Navbar

create a `components/layouts/navbar.tsx`.

Requirements:

- fixed height, with a sticky effect
- glassmorphism like effect
- should hold the logo, the connect wallet button, a notification bell icon
- have the logo be in a seperate element from te rest of the elements in the navbar and use flex and justtify between on them
- make it mobile responsive and on mobile and tab screen sizes add a rit panel button to open the sidebar

### sidebars

create a `components/layout/sidebar.tsx`.

Requirements:

- a height that feels the screen height - the navbar height on desktop screen sizes, and full the screen height on mobile screen with a close panel button

Do not build the sidebar inner layout yet

### bottom box

create a `components/layouts/bottom-nav.tsx`.

Requirements:

- a fixed height that will hold three buttons in it
- make it look very modern and AI

Do not give them any functionalities for now

### Check when done

- new components compile without TypeScript errors
- no lint errors
- The layout responds perfectly on all screen sizes
