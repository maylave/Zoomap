export interface Link {
	name: string
	path: string
}

export interface Social {
	url: string
	icon: string
}

 export interface BlockLink {
	nameblock: string
	links?: Link[]
	socials?: Social[]
}