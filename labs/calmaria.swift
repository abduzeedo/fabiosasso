import SwiftUI
import PlaygroundSupport
struct CalmariaHome: View {
    // Breathe
    @State var breathe = false
    // The sequence of exercise
    @State var exercise = false
    // Counter for the whole thing
    @State var timeCounter = 0
    // Counter for the label
    @State var labelCounter = 0
    // Repetitions
    @State var repetitions = 4
    // Show Modal
    @State var showModal = false
    // Modal Congratulations
    @State var showCongrats = false
    // Modal About
    @State var showAbout = true
    // Drag CongratsView
    @State var viewState = CGSize.zero
    // Drag AboutView
    @State var viewAbout = CGSize.zero
    // Light/Dark
    @Environment(\.colorScheme) var colorScheme
    // Instructions Array
    @State var instructionPosition = 0
    var instructions = ["Tap \ncircle to \nstart","Inhale \nfrom your \nnose","Hold \nyour \nbreath","Exhale \nfrom your \nmouth"]
    // Haptic feedback
    @State private var feedback = UINotificationFeedbackGenerator()
    let impactLight = UIImpactFeedbackGenerator(style: .light)
    let impactHeavy = UIImpactFeedbackGenerator(style: .heavy)
    // Lottie variables
    @State var playConfetti = 0
    //
    // Save data with UserDefaults
    @State var defaults = UserDefaults.standard
    @State var bCompleted = 00
    @State var labelCompleted : String = ""
    // 80s theme
    @State var theme80s = UserDefaults.standard.bool(forKey: "t80s")
    //
    // Timer
    //
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    @State var timeRemaining = 0
    //
    //
    //
    var body: some View {
        GeometryReader { geometry in
            ZStack{
                Color("background1")
                    .edgesIgnoringSafeArea(.all)
                // Circle + Graphics
                ZStack{
                    Image(uiImage: UIImage(named: "sun")!)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .padding()
                        .frame(height:(self.exercise ? geometry.size.width : geometry.size.width/1.5))
                        .animation(Animation.easeInOut(duration: (self.exercise ? 4 : 8)))
                        .onTapGesture {
                            self.impactLight.impactOccurred()
                            self.startBreathing()
                    }
                    // Different themes (blur and 80s)
                    ZStack{
                        if(self.colorScheme == .dark ){
                            if(self.theme80s){                        
                                Image(uiImage: UIImage(named: "sunlines")!).resizable().aspectRatio(contentMode: .fit).frame(maxWidth:.infinity).offset(y:100)
                                
                            }
                            else{
                                VisualEffectView(effect: UIBlurEffect(style: .prominent))
                                    .frame(height:geometry.size.height/1.8)
                                    .offset(y:geometry.size.height/3.8)
                            }
                        }
                        else{
                            if(self.theme80s){                        
                                Image(uiImage: UIImage(named: "sunlines")!).resizable().aspectRatio(contentMode: .fit).frame(width:geometry.size.width).offset(y:100).colorInvert()
                            }
                            else{
                                VisualEffectView(effect: UIBlurEffect(style: .light))
                                    .frame(height:geometry.size.height/1.8)
                                    .offset(y:geometry.size.height/3.8)
                            }
                        }
                    }
                }.edgesIgnoringSafeArea(.bottom).offset(y:20)
                // Text + Labels
                VStack{
                    HStack(alignment: .top){
                        VStack(alignment: .leading) {
                            Text("Focus /\nBreathe /\nRelax /")//"\(defaults.integer(forKey: "bCompleted"))"
                                .font(.title)
                                .fontWeight(.bold)
                            HStack{
                                Image(systemName: "ellipsis")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: 40, height: 40, alignment: .leading)
                            }
                            .offset(x: 0, y: 0)
                            .onTapGesture {
                                self.showAbout = true
                                self.showCongrats = false
                                self.impactLight.impactOccurred()
                                self.showModal.toggle()
                            }
                        }
                        Spacer()
                        Text("0\(self.repetitions)")
                            .font(.system(size: 96))
                            .fontWeight(.bold)
                    }.padding()
                    Spacer()
                    HStack(){
                        Text(self.instructions[self.instructionPosition])
                            .font(.system(size: 18))
                            .fontWeight(.bold)
                            .frame(width:120, alignment: .leading)
                            .padding(.bottom,16)
                        Spacer()
                        if(self.breathe){
                            Text("END NOW")
                                .font(.caption)
                                .fontWeight(.bold).padding(.vertical, 12).padding(.horizontal,12).background(Color.black)
                                .foregroundColor(Color.white)
                                .cornerRadius(24)
                                .onTapGesture {
                                    self.impactLight.impactOccurred()
                                    self.endExercise()
                            }
                        }
                        Spacer()
                        Text("0\(self.labelCounter)")
                            .font(.system(size: 52))
                            .fontWeight(.bold)
                            .frame(width:120, alignment: .trailing)
                        
                    }.padding(.horizontal)
                }//.frame(maxWidth:712).frame(maxHeight:geometry.size.height)
                    // Modal Screens
                    .sheet(isPresented: self.$showModal,onDismiss: {
                        UserDefaults.standard.set(self.theme80s, forKey: "t80s")
                    }){
                        if(self.showAbout){
                            AboutView(viewAbout : self.$viewAbout, showAbout: self.$showAbout, theme80s: self.$theme80s).edgesIgnoringSafeArea(.all)
                        }
                        if(self.showCongrats){
                            CongratsView(viewState: self.$viewState, showCongrats: self.$showCongrats, playConfetti: self.$playConfetti, defaults: self.$defaults, labelCompleted: self.$labelCompleted).edgesIgnoringSafeArea(.all)
                        }
                }
            }.onReceive(self.timer) { _ in
                if(self.repetitions > 0){
                    if(self.breathe){
                        self.timeCounter += 1
                        self.labelCounter -= 1
                        self.impactLight.impactOccurred()
                        // Inhale
                        if(self.timeCounter == 4){
                            self.labelCounter = 7
                            self.instructionPosition = 2
                            self.impactHeavy.impactOccurred()
                        }
                        // Hold
                        if(self.timeCounter == 4 + 7){
                            self.exercise.toggle()
                            self.labelCounter = 8
                            self.instructionPosition = 3
                            self.impactHeavy.impactOccurred()
                        }
                        // Exhale
                        if(self.timeCounter == 4 + 7 + 8){
                            self.exercise.toggle()
                            self.timeCounter = 0
                            self.labelCounter = 4
                            self.repetitions -= 1
                            self.instructionPosition = 1
                            self.impactHeavy.impactOccurred()
                        }
                    }
                    else{
                        self.timeCounter = .zero
                    }
                }
                if(self.repetitions == 0){
                    self.endExercise()
                    self.congratulate()
                }
            }
        }
    }
    func startBreathing(){
        if(!self.breathe){
            self.breathe.toggle()
            self.exercise.toggle()
            self.instructionPosition = 1
            self.playConfetti = 0
            self.labelCounter = 4
        }
        //        else{
        //            self.endExercise()
        //        }
    }
    func endExercise(){
        self.breathe = false
        self.exercise = false
        self.timeCounter = 0
        self.labelCounter = 0
        self.repetitions = 4
        self.instructionPosition = 0
    }
    func congratulate(){
        if(defaults.integer(forKey: "bCompleted") == 0){
            self.bCompleted += 1
        }
        else{
            self.bCompleted = defaults.integer(forKey: "bCompleted") + 1
        }
        defaults.set(bCompleted, forKey: "bCompleted")
        
        if(UserDefaults.standard.integer(forKey: "bCompleted") < 10 ){
            self.labelCompleted = "0\(defaults.integer(forKey: "bCompleted"))"
        }
        if(UserDefaults.standard.integer(forKey: "bCompleted") >= 10 ){
            self.labelCompleted = "\(defaults.integer(forKey: "bCompleted"))"
        }
        self.showAbout = false
        self.showCongrats = true
        self.showModal = true
        self.playConfetti += 1
    }
}
//
// Blur background effec
//
struct VisualEffectView: UIViewRepresentable {
    var effect: UIVisualEffect?
    func makeUIView(context: UIViewRepresentableContext<Self>) -> UIVisualEffectView { UIVisualEffectView() }
    func updateUIView(_ uiView: UIVisualEffectView, context: UIViewRepresentableContext<Self>) { uiView.effect = effect }
}

struct AboutView: View {
    @Binding var viewAbout : CGSize
    @Binding var showAbout : Bool
    @Binding var theme80s : Bool
    var body: some View {
        GeometryReader { geometry in
            VStack(alignment: .leading){
                HStack{
                    Spacer()
                    Rectangle().foregroundColor(Color("primary")).frame(width: 120, height:4).cornerRadius(2).offset(x: 0, y: 8)
                    Spacer()
                }
                Spacer()
                Text("Calmaria")
                    .font(.system(size:44))
                    .fontWeight(.bold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
                    .padding(.horizontal).padding(.bottom, 8)
                Text("[ feminine ] /kɑʊma’ɾia/")
                    .font(.headline)
                    .fontWeight(.medium)
                    .padding(.horizontal).padding(.bottom, 24)
                Text("In Portuguese means calmness and tranquility. It’s often used by seamen and surfers to indicate that there are no waves in the ocean. That mood perfectly translates what this app intends to do, bring peace of mind and tranquility to your busy day to day life. \n\nJust breathe and relax.")
                    .font(.headline).fontWeight(.regular).lineSpacing(6)
                    .padding()
                Spacer()
                Divider().padding(.horizontal)
                HStack{
                    Toggle(isOn: self.$theme80s) {
                        Text("Rock the 80s theme").font(.headline)
                    }.padding()
                    
                }
                Divider().padding(.horizontal)
                Text("Copyright Steale LLC")
                    .font(.footnote)
                    .padding().padding(.bottom, 24)
            }
            .frame(width: geometry.size.width)
            .background(Color("background1"))
        }
    }
}

struct CongratsView: View {
    @Binding var viewState : CGSize
    @Binding var showCongrats : Bool
    @Binding var playConfetti : Int
    @Binding var defaults : UserDefaults
    @Binding var labelCompleted : String
    
    var body: some View {
        GeometryReader { geometry in
            ZStack{
                //LottieView(name: "confetti", playConfetti: self.$playConfetti).edgesIgnoringSafeArea(.all)
                VStack(alignment: .leading){
                    HStack{
                        Spacer()
                        // Handle to dismiss
                        Rectangle()
                            .foregroundColor(Color("primary"))
                            .frame(width: 120, height:4)
                            .cornerRadius(2)
                            .offset(x: 0, y: 8)
                        Spacer()
                    }
                    // Text with the number of times user finished the exercise
                    Text("\(self.labelCompleted)")
                        .font(.system(size:54)).fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/).padding()
                    Spacer()
                    Text("Congratulations")
                        .font(.system(size:72))
                        .fontWeight(.bold)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                        .padding(.horizontal)
                    Spacer()
                    Text("Breathing \nsession \ncompleted")
                        .font(.system(size:18))
                        .fontWeight(.bold)
                        .padding(.horizontal).padding(.bottom, 32)
                }
            }.background(Color("background1"))
        }
    }
}
PlaygroundPage.current.setLiveView(CalmariaHome().frame(width:640))
