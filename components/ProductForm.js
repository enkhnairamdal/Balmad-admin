import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable} from "react-sortablejs";
export default function ProductForm({
    _id,
    title:existingTitle,
    description:exixtingDescription,
    price:existingPrice,
    images:existingImages,
    category:assignedCategory,
}){
    const [title , setTitle] = useState(existingTitle || '')
    const [description , setDescription] = useState(exixtingDescription ||'')
    const [price , setPrice] = useState(existingPrice || '')
    const [ images , setImages] = useState (existingImages || [])
    const [category , setCategory] = useState(assignedCategory || '')
    const [goToProducts, setGoToProducts] = useState(false)
    const [isUploading , setUploading] = useState(false)
    const [categories , setCategories] = useState ([])
    const router = useRouter()
    useEffect(()=> {
        axios.get('/api/categories' ).then(result => {
            setCategories(result.data)
        })
    },[])
    async function saveProduct(e){
        e.preventDefault()
        const data ={title, description, price, images}
        if(_id) {
           
            await axios.put('/api/products',{...data,category, _id})
            
        }else{
          
            await axios.post('/api/products', data );
        }
        setGoToProducts(true)
       
    }
    if(goToProducts){
         router.push('/products')
    }
   async function uploadImages(e){
        const files =e.target?.files
        if(files?.length > 0){
            setUploading(true)
            const data = new FormData();
            for(const file of files){
                data.append('file' ,file)
            }
            const res = await axios.post('/api/upload', data);
            setImages(oldImages => {
                return[...oldImages, ...res.data.links]
            })
            setUploading(false)
        }
    }
    function updateImagesOrder(images){
        setImages(images)
    }
    return(
        
            <form onSubmit={saveProduct}>
            <label>Product name</label>
            <input type="text" placeholder="product name" value={title} onChange={e => setTitle(e.target.value)} />
            <label>Category</label>
            <select 
                value={category}
                onChange={e => setCategory(e.target.value)}

            >
                <option>Uncategorized</option>
                {categories.length > 0 && categories.map(c => (
                    <option value={c._id}>{c.name}</option>
                ))}

            </select>
            <label>Photos</label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable className="flex flex-wrap gap-1" list={images} setList={updateImagesOrder}>
                {!!images?.length && images.map(link => (
                    <div className=" h-24 " key={link}>
                        <img className="rounded-lg" src={link}/>
                    </div>
                )) }
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 p-1 flex items-center" ><Spinner/> </div>

                )}
                <label className=" w-24 h-24 cursor-pointer text-center flex items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
</svg>
        <div>
        Upload
        </div>
        <input type="file" onChange={uploadImages} className="hidden"/>
                </label>
                
            </div>
            <label>Description</label>
            <textarea placeholder="description" value={description}onChange={e => setDescription(e.target.value)}/>
            <label>Price (in MNT)</label>
            <input type="text" placeholder="price" value={price} onChange={e => setPrice(e.target.value)} ></input>
            <button type="submit" className="btn-primary">Save</button>
            </form>
       
    )
}