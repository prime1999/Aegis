We create a mobile UI for the sidebars

## Create the UI for both sidebars

Create the sheet components for both sidebars

- Create a sheet component `/components/MobileSidebar` using shadcn sheet for the sidebar component
- Create a sheet component `/components/MobileUpdatesSidebar` using shadcn sheet for the updatesSidebar component
- this component will only be created on mobile screens
- Also the current updatesSidebar and sidebar component `/components/updatesSidebar` `/components/sidebar` will not be available on mobile screen

## Create the buttons for the sheets

Create the open button for the sheets

- so when the analysis result is ready, on mobile screens a button to that will trigger the `/components/sidebar`
- The sidebar and updatesSidebar will not be available on mobile screen
- Also when the updates result is ready, on mobile screens a button to that will trigger the `/components/updatesSidebar`

## The data the sheets will have

The sheets should use these results

- For the `/components/sidebar` the data will be the analysis result
  For the `/components/updatesSidebar` te data will be update

Do not attach any other functionalities or UI

### Check when done

- new components compile without TypeScript errors
- no lint errors
- make sure the sheets are only available on mobile screen
