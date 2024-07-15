export default function NFTBox({ name, image, description, attributes }) {
    return (
        <div className="max-w-sm bg-white border border-zinc-200 shadow dark:bg-zinc-800 dark:border-zinc-700 mb-10">
            <a href={image} target="_blank" rel="noopener noreferrer">
                <img className="rounded-lg" src={image} alt={`NFT ${name}`} />
            </a>
            <div className="p-5">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white tracking-widest">{name}</h5>
                <p className="text-sm mb-4 font-normal text-zinc-700 dark:text-zinc-400">{description}</p>
                <h6 className="mb-1 text-l font-bold tracking-tight text-zinc-900 dark:text-white tracking-widest">Attributes:</h6>
                <ul className="list-inside list-disc text-sm font-semibold mb-2 font-normal text-zinc-700 dark:text-zinc-300 leading-6">
                    <li>Palette: {attributes.Palette}</li>
                    <li>Branch Length: {attributes.BranchLength} </li>
                    <li>Depth: {attributes.Depth}</li>
                </ul>
            </div>
        </div>
    )
}