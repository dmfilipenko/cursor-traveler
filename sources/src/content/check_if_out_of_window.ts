document.addEventListener("mouseleave", function(event){

    if(event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight))
    {
  
       console.log("I'm out");
  
    }
  });