import SwiftUI
import MapKit
import PlaygroundSupport
struct Screen : View{
    @State var latitude = 37.7749
    @State var longitude = -122.4194
    @State var initial = false
    static let lightStart = Color(red: 30 / 255, green: 34 / 255, blue: 46 / 255)
    var body: some View {
        GeometryReader{ geometry in
            ZStack{
                ZStack{
                    Circle().fill(LinearGradient(gradient: Gradient(colors: [.yellow, .orange, .pink]), startPoint: .top, endPoint: .bottom)).offset(y:geometry.size.height / 4).clipped()
                }.frame(height:geometry.size.height/2).offset(y:(geometry.size.height / 4) * -1)
                ZStack{
                    Circle().fill(LinearGradient(gradient: Gradient(colors: [.yellow, .orange, .pink]), startPoint: .top, endPoint: .bottom)).offset(y:-geometry.size.height / 4).blur(radius: 92).clipped()
                }.frame(height:geometry.size.height/2).offset(y:(geometry.size.height / 4))
            }
        }
    }
}
//
// Blur background effect
//
struct Blur: UIViewRepresentable {
    var style: UIBlurEffect.Style
    
    func makeUIView(context: Context) -> UIVisualEffectView {
        return UIVisualEffectView(effect: UIBlurEffect(style: style))
    }
    
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {
        uiView.effect = UIBlurEffect(style: style)
    }
}

PlaygroundPage.current.setLiveView(Screen())

