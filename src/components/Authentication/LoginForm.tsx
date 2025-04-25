"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LogIn } from "lucide-react"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectVerificationStatus, setCredentialsForVerificationStatus } from "@/redux/slices/authSlice"
import { useNavigate } from "react-router-dom"
import { login } from "@/services/AuthService"
import { selectAuthError, selectAuthStatus, selectIsAuthenticated } from "@/redux/slices/authSlice"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
  rememberMe: z.boolean().default(false),
})

export default function LoginForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const authStatus = useAppSelector(selectAuthStatus)
  const authError = useAppSelector(selectAuthError)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const verificationStatus = useAppSelector(selectVerificationStatus)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const user = await dispatch(login(values)).unwrap()

      dispatch(
        setCredentialsForVerificationStatus({
          isVerificationInProgress: false,
          isVerificationFails: false,
          verificationError: null,
          isVerificationSuccess: true,
        }),
      )

      toast({
        title: "Login successful!",
        description: "Welcome back!",
      })

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Login failed:", error)

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Your Email or password must be wrong! Please try again.",
      })
    }
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-800">Sign in to your account</h1>
        <p className="text-gray-500 mt-2">Enter your credentials to access your dashboard</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.email@school.saral"
                    className="rounded-lg border-gray-200 focus:border-orange-500 focus:ring focus:ring-orange-200 transition"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700">Password</FormLabel>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onForgotPassword()
                    }}
                    className="text-sm text-orange-600 hover:text-orange-800 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="rounded-lg border-gray-200 focus:border-orange-500 focus:ring focus:ring-orange-200 transition"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-600">Remember me for 30 days</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Don't have an account?{" "}
          <a href="#" className="text-orange-600 hover:underline font-medium">
            Contact administrator
          </a>
        </p>
      </div>
    </>
  )
}
