import LastFMTyped from 'lastfm-typed';
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
  
  lastfm = new LastFMTyped(this.API_KEY, this.lastFmTypedOptions);

  listening: Map<string, Album[]> = new Map();
  newListens: Map<string, Album[]> = new Map();
  
  async main() {
    
    const topAlbums7Day = await this.lastfm.user.getTopAlbums(this.USER, { period: '7day' });
    const listening = new Map<string, Album[]>();
    const newListens = new Map<string, Album[]>();

    for (let x of topAlbums7Day['albums']) {
      let album: Album = {
        artist: x.artist.name,
        album: x.name,
        mbid: x.mbid,
        playcount: x.playcount,
      }
      if (album.playcount > 4) {
        await this.determineNewListen(album);
        album.newListen ? this.pushToMap(album, newListens) : this.pushToMap(album, listening);
      } 
    }

    let outstring = this.buildOutputString(listening, newListens);
    console.log(outstring)
  }

  buildOutputString(listening: Map<string, Album[]>, newListens: Map<string, Album[]>) {
    let outString = 'First Listens:\n\n';
    for (let [x, y] of newListens) {
      let albumNames = y.map(y => y.album).join(', ')
      outString = outString + `${x} - ${albumNames}\n`
    }
    outString = outString + '\nListening: \n\n' 
    for (let [x, y] of listening) {
      let albumNames = y.map(y => y.album).join(', ')
      outString = outString + `${x} - ${albumNames}\n`
    }
    return outString;
  }

  pushToMap(album: Album, map: Map<string, Album[]>) {
    map.has(album.artist) ? map.get(album.artist)?.push(album) : map.set(album.artist, [album]);
  }

  async determineNewListen(album: Album) {
    let albumInfo: any

    if (album.mbid) {
      albumInfo = await this.lastfm.album.getInfo({ mbid: album.mbid }, {username: this.USER})
    } else if (album.album && album.artist) {
      albumInfo = await this.lastfm.album.getInfo({ album: album.album, artist: album.artist }, {username: this.USER})
    }

    album.newListen = albumInfo.userplaycount === album.playcount ? true : false;
  }
}