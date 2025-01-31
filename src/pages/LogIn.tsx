'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn } from 'lucide-react'
import ApiService from '@/services/ApiService'
import { useAppDispatch } from '@/redux/hooks/useAppDispatch'
import { useAppSelector } from '@/redux/hooks/useAppSelector'
import { selectAuthError, selectAuthStatus, selectIsAuthenticated } from '@/redux/slices/authSlice'
import { login } from '@/services/AuthService'
import { useNavigate } from 'react-router-dom'

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
})

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authStatus = useAppSelector(selectAuthStatus)
  const authError = useAppSelector(selectAuthError)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/d/staff")
    }
  }, [isAuthenticated, navigate])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const loggedInUser = await dispatch(login(values)).unwrap();
      console.log("loggedInUser", loggedInUser);

      // If login is successful, the useEffect above will handle the redirection
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="hidden md:block bg-gray-200">
          <img src="/placeholder.svg?height=600&width=600" alt="School" className="object-cover w-full h-full" />
        </div>
        <div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={authStatus === "loading"}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {authStatus === "loading" ? "Logging in..." : "Log In"}
                </Button>
                {authError && <p className="text-red-500 text-sm">{authError}</p>}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </a>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}


