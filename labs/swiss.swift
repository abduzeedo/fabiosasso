import SwiftUI
import PlaygroundSupport
struct Screen : View{
    @State var initial = false
    var body: some View {
        GeometryReader{ geometry in
            ZStack{
                ZStack{
                    Rectangle()
                        .foregroundColor(Color.red)
                        .cornerRadius((self.initial ? 400 : 0))
                        .frame(width: (self.initial ? geometry.size.height / 2 : geometry.size.width / 1.2) , height: geometry.size.height / 2)
                        .offset(x:(self.initial ? 0 : geometry.size.width / -5), y:self.initial ? 0 : geometry.size.height / -4)
                        .blendMode(.multiply)
                        .animation(.spring(response: 0.5, dampingFraction: 0.5, blendDuration: 0.5))
                    
                    Rectangle().foregroundColor(Color.yellow)
                        .cornerRadius((self.initial ? 400 : 0))
                        .frame(width: (self.initial ? geometry.size.height / 2 : geometry.size.width / 1.2) , height: geometry.size.height / 2)
                        .offset(x:geometry.size.width / -5, y:geometry.size.height / 4)
                        .blendMode(.multiply).animation(.spring(response: 0.5, dampingFraction: 0.5, blendDuration: 0.5))
                    
                    Rectangle().foregroundColor(Color.blue)
                        .cornerRadius((self.initial ? 400 : 0))
                        .frame(width: (self.initial ? geometry.size.height / 2 : geometry.size.width / 1.8) , height: geometry.size.height / 2)
                        .offset(x:geometry.size.width / 4, y: (self.initial ? geometry.size.height / 4 : 0))
                        .blendMode(.multiply).animation(.spring(response: 0.5, dampingFraction: 0.5, blendDuration: 0.5)).onTapGesture {
                            self.initial.toggle()
                    }
                }.rotationEffect(.degrees(self.initial ? 360 : 0)).scaleEffect(self.initial ? 0.8 : 1).animation(Animation.spring(response: 0.5, dampingFraction: 0.5, blendDuration: 2))
                HStack{
                    VStack(alignment: .leading){
                        Text("learning").font(.caption).fontWeight(.medium).padding(.top,56)
                        Text("swiftUI").font(.system(size: 64)).fontWeight(.bold)
                        Text("recreating \nswiss style\nartworks").font(.body).fontWeight(.medium)
                        Spacer()
                    }.padding(.leading,48)
                    Spacer()
                }
            }
        }
    }
}

PlaygroundPage.current.setLiveView(Screen())
