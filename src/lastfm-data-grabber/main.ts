import LastFMTyped from 'lastfm-typed';
import AlbumClass from 'lastfm-typed/dist/classes/album';
import { Album } from './album.interface';
export class LastFmDataGrabber {
  constructor() {}

  API_KEY: string = process.env.API_KEY!
  SECRET_KEY: string = process.env.SHARED_SECRET!


  USER = 'ndeast'

  lastFmTypedOptions = {
    apiSecret: this.SECRET_KEY,
    userAgent: "NavalGazingBot",
    secureConnection: true
  };

  lastFmTopAlbumOptions = {
      userinput: this.USER, 
      sk: null,
      username: this.USER,
      limit: 50,
      page: 2,
      period: '7day' 
  }
  
  lastfm = new LastFMTyped(this.API_KEY, this.lastFmTypedOptions);

  listening: Map<string, Album[]> = new Map();
  newListens: Map<string, Album[]> = new Map();
  
  async main() {
    
    const topAlbums7Day = await this.lastfm.user.getTopAlbums(this.USER, { period: '7day' });

    for (let x of topAlbums7Day['albums']) {
      let album: Album = {
        artist: x.artist.name,
        album: x.name,
        mbid: x.mbid,
        playcount: x.playcount
      }
      if (album.playcount > 4) {
        await this.populateListWithAlbum(album)
      }
    }
    
    console.log("New Listens: ", this.newListens)
    console.log("Listening: ", this.listening)
    
  }
  
  async populateListWithAlbum(album: Album) {
    if (await this.determineNewListen(album) === true) {
      this.pushToMap(album, this.newListens)
    } else { 
      this.pushToMap(album, this.listening)
    }
  }

  pushToMap(album: Album, map: Map<string, Album[]>) {
    if (map.has(album.artist)){
      map.get(album.artist)?.push(album);
    } else {
      map.set(album.artist, [album]);
    }
  }

  async determineNewListen(album: Album) {
    let albumInfo: any
    if (album.mbid) {
      albumInfo = await this.lastfm.album.getInfo({ mbid: album.mbid }, {username: this.USER})
    } else if (album.album && album.artist) {
      albumInfo = await this.lastfm.album.getInfo({ album: album.album, artist: album.artist }, {username: this.USER})
    }

    if ( albumInfo.userplaycount === album.playcount) {
      return true
    }
    
    return false
  }
}