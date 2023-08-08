import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { supabase } from './supabaseClient';

const Auth = () => {
    const [errorMsg, setErrorMsg] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    async function onSubmit({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        console.log(data, error);
        if (error) {
            setErrorMsg(error.message);
        }
    }

    // https://www.freecodecamp.org/news/how-to-create-forms-in-react-using-react-hook-form/
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Email</label>
                    <input
                        type="text"
                        name="email"
                        {...register('email', {
                            required: 'Email is required.',
                            pattern: {
                                value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                                message: 'Email is not valid.',
                            },
                        })}
                    />
                    {errors.email && <p>{errors.email.message}</p>}
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        {...register('password', { required: true })}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {errorMsg && <div>{errorMsg}</div>}
        </div>
    );
};

export default Auth;
