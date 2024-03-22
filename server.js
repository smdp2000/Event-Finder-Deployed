const express = require("express");
const app = express();
const axios = require("axios");
const apikey = 'zMcFauK2bK6lA8H3JfTHqncFofsT8qtK'
const path = require('path');

app.use('/',express.static(path.join(__dirname,"frontend/build")));
//app.use(express.static("public"));

const port = process.env.PORT || 3000

var cors = require('cors')
app.use(cors())
var SpotifyWebApi = require('spotify-web-api-node');
var geohash = require('ngeohash');

var clientId = 'cf4f829c14984e4897f82ece22f312b9',
  clientSecret = 'dab3818160cd4995a57ad2f0d6c53454';

// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

// Retrieve an access token.    




app.listen(port, () => console.log(`Running this server on ${port}`));


const segmentId ={
    'Default':'',
    'Music' : 'KZFzniwnSyZfZ7v7nJ',
    'Sports': 'KZFzniwnSyZfZ7v7nE',
    'Arts & Theatre': 'KZFzniwnSyZfZ7v7na',
    'Film': 'KZFzniwnSyZfZ7v7nn',
    'Miscellaneous':'KZFzniwnSyZfZ7v7n1'

}

app.get("/", (req, res) => {
  res.redirect("/search");
});


app.get("/suggest",(req, res)=>{
    res.set('Access-Control-Allow-Origin', '*');
    //console.log(req)

        //console.log(req.query)
        const keyword = req.query.keyword;
       // console.log(keyword)
        axios.get("https://app.ticketmaster.com/discovery/v2/suggest?apikey="+apikey+'&keyword='+keyword)
        .then((result)=>{
            
            res.json(result.data)
        }).catch((err)=>{
            console.log(err)
        })
})


app.get("/artist",(req, res)=>{

    res.set('Access-Control-Allow-Origin', '*');
    const keyword = req.query.artist;

    //console.log('here')

    let Artists;
    
    spotifyApi
    .clientCredentialsGrant()
    .then((data) => {
      spotifyApi.setAccessToken(data.body.access_token);
   //   console.log(`Access token: ${data.body.access_token}`);
    })
    // Get information about an artist
    .then(() => {
      return spotifyApi.searchArtists(keyword);
    })
    .then((data) => {
        let current_artist = data.body          
        Artist ={
        'name' : current_artist.artists.items[0].name,
        'followers' : current_artist.artists.items[0].followers.total,
        'popularity' : current_artist.artists.items[0].popularity,
        'url' :  current_artist.artists.items[0].external_urls.spotify,
        'img1' : current_artist.artists.items[0].images[0].url
        }

      const artistId = data.body.artists.items[0].id;

   //   console.log(`Artist ID: ${artistId}`);
      return artistId;
    })
    // Get information about an artist's albums
    .then((artistId) => {
      return spotifyApi.getArtistAlbums(artistId, { limit: 3 });
    })
    .then((data) => {
        console.log("HEREEEEEEEEEEEEEEEEEEEEEES")
        console.log(data.body.items)
       // console.log(data.body.items[0].images[0].url)
        Artist['alb1'] = data.body.items[0].images[0].url
       // console.log(data.body.items[0].images[1].url)

        Artist['alb2']= data.body.items[1].images[0].url
        //console.log(data.body.items[0].images[2].url)

        Artist['alb3']= data.body.items[2].images[0].url

        res.json( Artist)
       // console.log('hello')
    })
    .catch((error) => console.error(error));
})

app.get("/events", (req, res)=>{
    res.set('Access-Control-Allow-Origin', '*');


    console.log(req.query)
    const event = req.query.keyword;
    const distance = req.query.distance;
    const category = req.query.category;

    const lat = req.query.lat;
    const lon = req.query.lon;
    const geohashcode = geohash.encode(lat, lon)
    console.log(geohashcode)

    const URL = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+apikey+'&keyword='+encodeURIComponent(event)+'&segmentId='+segmentId[category]+'&radius='+distance+'&unit=miles'+'&geoPoint='+geohashcode
   console.log(URL)
    axios.get(URL)
    .then((result)=>{
        res.json(result.data)
    }).catch((err)=>{
     //   console.log(err)
    })

})

app.get("/eventinfo", (req, res)=>{
    res.set('Access-Control-Allow-Origin', '*');
    //console.log(req)


    //console.log(req.query)
    const id = req.query.key;
    const URL = "https://app.ticketmaster.com/discovery/v2/events/"+id+".json?apikey="+apikey
  //  console.log(URL)
    axios.get(URL)
    .then((result)=>{
        
        res.json(result.data)
    }).catch((err)=>{
  //      console.log(err)
    })

})


app.get("/venueinfo", (req, res)=>{
  res.set('Access-Control-Allow-Origin', '*');
  //console.log(req)


  //console.log(req.query)
  const id = req.query.key;
  const URL = "https://app.ticketmaster.com/discovery/v2/venues/?apikey="+apikey+"&keyword="+encodeURIComponent(id)

//  console.log(URL)
  axios.get(URL)
  .then((result)=>{
      
      res.json(result.data)
  }).catch((err)=>{
//      console.log(err)
  })

})


app.get("*", (req, res) => {
  res.sendFile(__dirname+'/build/index.html');
});