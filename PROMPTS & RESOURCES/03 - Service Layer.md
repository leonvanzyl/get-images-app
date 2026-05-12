c:\Projects\get-images-app\PROMPTS\ARCHITECTURE.png 
  Hi there. I need you to continue working on this application. I've attached an
  architecture diagram that details the target scope or architecture of this       
  application. For now, let's only focus on the Service Layer. In the Service
  Layer, we want one function: the ability to generate images using an AI model.   
  For this application, we will give the user the choice between OpenAI and
  Gemini, and for each we will expose the different available models. For
  example, for OpenAI we'll expose image 1.5 and image 2. For Gemini we'll expose
  the Nano Banana models. Keep in mind that the service layer should be
  accessible by different channels like the UI, MCP servers, APIs, and CLI tools.  
  Just keep this architecture in mind when setting all of this up.
  
  In order to test this service layer and the new function, let's also set up one
  of the channels, like the web UI. We should be able to use the dashboard to      
  generate images or test generating images using this new function. 