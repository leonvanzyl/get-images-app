& 'c:\Projects\get-images-app\PROMPTS & RESOURCES\ARCHITECTURE.png' All right
then, we're able to generate images now using the dashboard page. Now,
following the architecture diagram, all of this is set up. What I want you to
do now is implement a solution that will use credits in order to generate
images. Now, I don't want you to implement the entire payment solution at this
stage. We'll get to that at a later point. For now, I just want to be able to
manually add credits to a user's account. Every time I generate an image, that
will deduct a credit from their account. For existing users in the database and
new users signing up, they will have, by default, zero credits. In order to  
 add credits, I'll have to log into the database and add credits manually at
this stage. When designing this credit system, keep in mind that at some point
we will add a payment system like Polar or Stripe. Whatever you design now will  
 have to eventually play nice with an actual payment solution.
