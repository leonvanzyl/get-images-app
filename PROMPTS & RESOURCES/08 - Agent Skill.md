Please use your skill-creator skill to set up the following.
[Pasted text #1 +2 lines] Get images also supports different aspect ratios,  
 so the model should ask the user which aspect ratio they want to use. Again,  
 this needs to be based on the aspect ratios available in Get images. There  
 are a few scenarios where asking for this information might not be needed.  
 You have to look at the conversation's context to understand what you need to  
 ask the user and when. For example, if the user is building a website and in  
 the web page they need a stock image next to the Euro section as an example,  
 you need to figure out, based on the layout and the position of that image,  
 what the resolution or aspect ratio of that image should be. Here is another
use case that you need to consider. Normally, the user would give you a  
 prompt of what they're trying to generate, but if you already have all of the
context based on the conversation, you can defer this yourself. Again, take  
 aspect ratios available in Get images. There are a few scenarios where asking for this information might not be needed. You have to look at the conversation's context to understand what you need to ask the user and when. For example, if the user is building a website and in the web page they need a stock image next to the Euro section as an example, you need to figure out, based on the layout and the position of that image, what the resolution or aspect ratio of that image should be. Here is another use case that you need to consider. Normally, the user would give you a prompt of what they're trying to generate, but if you already have all of the context based on the conversation, you can defer this yourself. Again, take the example where you're building a web app. In the web app, on the homepage, we need to create a URL. You could simply propose to the user what the prompt could be, or maybe the user will tell you just to look at the page and decide for yourself. Then the agent should use the available context to determine what should be in the image. The same thing goes for storage. Normally, this MCP tool will give you a URL, which is not very helpful to the user. You might need to ask the user where this image should be stored. Again, in the context of building a web app, you could imply that the image should be stored in the `assets` or `public` folder, depending on the tech stack. Here is another super important workflow. Depending on what the user is trying
to achieve, you might have to use high-resolution images for infographics,  
 graphics design, posters, or thumbnails. If you're using the image on the web,
you do not want to use a massive file. If this image needs to be optimised  
 for the web, then you need to convert this image into something like WebP  
 before using it in the website. This skill should have a script available that
the agent can use to convert these images into webp. You can add any other  
 utilities that you think might be useful for optimising these images based on  
 different use cases. This should also include very clear instructions to the  
 agent as to when to use which script.
