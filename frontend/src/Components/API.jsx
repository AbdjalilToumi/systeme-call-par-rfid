const severHost = import.meta.env.VITE_SEVER_HOST_LINK;

const LoginURL = '/api/login'


export const FectchLogin = async ( email, password) => {
    
    try{
        const response = fetch(`${severHost}${LoginURL}`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email, password})
        });

        if(response.ok){    
            const { message }  = await response.json();
            return {
                message: message,
                status: true
            };
        }
        else{
            const { error } = await response.json();
            return {
                error: error,
                status: false
            }
        }
    }
    catch(err){
        console.error(err);
        throw new Error(err);
    }
}